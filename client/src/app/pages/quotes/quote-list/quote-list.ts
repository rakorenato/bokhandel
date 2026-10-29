import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Quote } from '../../../core/models/quote';
import { QuoteService } from '../../../core/services/quote.service';
import { ToastService } from '../../../core/services/toast.service';
import { getErrorMessage } from '../../../core/utils/error-message';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

/**
 * "Mina citat" – lista med favoritcitat.
 * Samma formulär används för att lägga till och redigera.
 */
@Component({
  selector: 'app-quote-list',
  imports: [ReactiveFormsModule, ConfirmDialog],
  templateUrl: './quote-list.html',
  styleUrl: './quote-list.scss',
})
export class QuoteList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly quoteService = inject(QuoteService);
  private readonly toast = inject(ToastService);

  private readonly textInput = viewChild<ElementRef<HTMLTextAreaElement>>('textInput');

  protected readonly maxLength = 500;

  protected readonly quotes = signal<Quote[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  /** Citatet som redigeras just nu (null = nytt citat). */
  protected readonly editing = signal<Quote | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly quoteToDelete = signal<Quote | null>(null);
  protected readonly deleting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(this.maxLength)]],
    author: ['', [Validators.required, Validators.maxLength(100)]],
  });

  protected get c() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.loadQuotes();
  }

  protected loadQuotes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.quoteService
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (quotes) => this.quotes.set(quotes),
        error: (err) => this.error.set(getErrorMessage(err, 'Kunde inte hämta citaten.')),
      });
  }

  // ---------- Lägg till / redigera ----------

  protected startEdit(quote: Quote): void {
    this.editing.set(quote);
    this.formError.set(null);
    this.form.setValue({ text: quote.text, author: quote.author });

    // Scrolla upp till formuläret (viktigt på mobil) och sätt fokus.
    const textarea = this.textInput()?.nativeElement;
    textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => textarea?.focus({ preventScroll: true }), 300);
  }

  protected cancelEdit(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.submitted.set(false);
    this.form.reset();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.submitted.set(true);
      return;
    }

    const value = this.form.getRawValue();
    const request = { text: value.text.trim(), author: value.author.trim() };
    const editing = this.editing();

    this.saving.set(true);
    this.formError.set(null);

    const save$ = editing
      ? this.quoteService.update(editing.id, request)
      : this.quoteService.create(request);

    save$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (saved) => {
        if (editing) {
          this.quotes.update((list) => list.map((q) => (q.id === saved.id ? saved : q)));
          this.toast.success('Citatet uppdaterades.');
        } else {
          this.quotes.update((list) => [saved, ...list]);
          this.toast.success('Citatet lades till.');
        }
        this.cancelEdit();
      },
      error: (err) => this.formError.set(getErrorMessage(err, 'Kunde inte spara citatet.')),
    });
  }

  protected showError(name: 'text' | 'author'): boolean {
    // Visa fel först när man har börjat skriva eller försökt spara,
    // så att ett tomt formulär inte blir rött efter att man sparat.
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || this.submitted());
  }

  // ---------- Radera ----------

  protected askDelete(quote: Quote): void {
    this.quoteToDelete.set(quote);
  }

  protected confirmDelete(): void {
    const quote = this.quoteToDelete();
    if (!quote) return;

    this.deleting.set(true);
    this.quoteService
      .delete(quote.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.quotes.update((list) => list.filter((q) => q.id !== quote.id));
          if (this.editing()?.id === quote.id) this.cancelEdit();
          this.quoteToDelete.set(null);
          this.toast.success('Citatet togs bort.');
        },
        error: (err) => {
          this.quoteToDelete.set(null);
          this.toast.error(getErrorMessage(err, 'Kunde inte radera citatet.'));
        },
      });
  }
}
