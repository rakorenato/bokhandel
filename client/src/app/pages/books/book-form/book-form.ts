import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { BookRequest } from '../../../core/models/book';
import { BookService } from '../../../core/services/book.service';
import { ToastService } from '../../../core/services/toast.service';
import { getErrorMessage } from '../../../core/utils/error-message';

/** Dagens datum som ÅÅÅÅ-MM-DD (lokal tid). */
function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function notInFuture(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  return value && value > today() ? { future: true } : null;
}

/**
 * Formulär som används både för "Lägg till ny bok" (/books/new)
 * och "Redigera bok" (/books/:id/edit).
 */
@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
})
export class BookForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bookService = inject(BookService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Route-parametern :id (finns bara vid redigering). */
  readonly id = input<string>();

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly maxDate = today();

  protected readonly genres = [
    'Roman', 'Deckare', 'Fantasy', 'Science fiction', 'Biografi', 'Historia',
    'Fackbok', 'Poesi', 'Skräck', 'Barn & ungdom', 'Självhjälp', 'Klassiker',
  ];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    author: ['', [Validators.required, Validators.maxLength(150)]],
    publishedDate: ['', [Validators.required, notInFuture]],
    genre: ['', Validators.maxLength(50)],
  });

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected get c() {
    return this.form.controls;
  }

  ngOnInit(): void {
    if (this.isEdit()) this.loadBook();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: BookRequest = {
      title: value.title.trim(),
      author: value.author.trim(),
      publishedDate: value.publishedDate,
      genre: value.genre.trim() || null,
    };

    this.saving.set(true);
    this.error.set(null);

    const save$ = this.isEdit()
      ? this.bookService.update(Number(this.id()), request)
      : this.bookService.create(request);

    save$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (book) => {
        this.toast.success(this.isEdit() ? `"${book.title}" uppdaterades.` : `"${book.title}" lades till.`);
        // Tillbaka till startsidan, där boken markeras kort.
        this.router.navigate(['/books'], { state: { highlightId: book.id } });
      },
      error: (err) => this.error.set(getErrorMessage(err, 'Kunde inte spara boken.')),
    });
  }

  protected showError(name: 'title' | 'author' | 'publishedDate' | 'genre'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  private loadBook(): void {
    const id = Number(this.id());
    if (!Number.isInteger(id) || id <= 0) {
      this.toast.error('Ogiltigt bok-id.');
      this.router.navigate(['/books']);
      return;
    }

    this.loading.set(true);
    this.bookService
      .getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (book) =>
          this.form.setValue({
            title: book.title,
            author: book.author,
            publishedDate: book.publishedDate,
            genre: book.genre ?? '',
          }),
        error: (err) => {
          this.toast.error(getErrorMessage(err, 'Kunde inte hämta boken.'));
          this.router.navigate(['/books']);
        },
      });
  }
}
