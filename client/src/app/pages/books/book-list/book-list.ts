import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Book } from '../../../core/models/book';
import { BookService } from '../../../core/services/book.service';
import { ToastService } from '../../../core/services/toast.service';
import { getErrorMessage } from '../../../core/utils/error-message';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

type SortOption = 'newest' | 'title' | 'author' | 'published-desc' | 'published-asc';

@Component({
  selector: 'app-book-list',
  imports: [RouterLink, DatePipe, ConfirmDialog],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly toast = inject(ToastService);

  protected readonly books = signal<Book[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly sort = signal<SortOption>('newest');

  /** Boken som nyss lades till/ändrades – markeras kort i listan. */
  protected readonly highlightId = signal<number | null>(null);

  // Radera
  protected readonly bookToDelete = signal<Book | null>(null);
  protected readonly deleting = signal(false);

  /** Listan efter sökning och sortering. */
  protected readonly visibleBooks = computed(() => {
    const term = this.search().trim().toLowerCase();
    const filtered = term
      ? this.books().filter((b) =>
          [b.title, b.author, b.genre ?? ''].some((field) => field.toLowerCase().includes(term)),
        )
      : [...this.books()];

    const byText = (a: string, b: string) => a.localeCompare(b, 'sv');

    switch (this.sort()) {
      case 'title':
        return filtered.sort((a, b) => byText(a.title, b.title));
      case 'author':
        return filtered.sort((a, b) => byText(a.author, b.author));
      case 'published-desc':
        return filtered.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
      case 'published-asc':
        return filtered.sort((a, b) => a.publishedDate.localeCompare(b.publishedDate));
      default:
        return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  });

  ngOnInit(): void {
    // Formuläret skickar med id:t på den sparade boken via navigation state.
    const highlight = (history.state as { highlightId?: number } | null)?.highlightId;
    if (highlight) {
      this.highlightId.set(highlight);
      setTimeout(() => this.highlightId.set(null), 2500);
    }

    this.loadBooks();
  }

  protected loadBooks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookService
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (books) => this.books.set(books),
        error: (err) => this.error.set(getErrorMessage(err, 'Kunde inte hämta böckerna.')),
      });
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected onSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as SortOption);
  }

  protected askDelete(book: Book): void {
    this.bookToDelete.set(book);
  }

  protected cancelDelete(): void {
    this.bookToDelete.set(null);
  }

  protected confirmDelete(): void {
    const book = this.bookToDelete();
    if (!book) return;

    this.deleting.set(true);
    this.bookService
      .delete(book.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          // Ta bort boken från listan direkt, utan att ladda om sidan.
          this.books.update((list) => list.filter((b) => b.id !== book.id));
          this.bookToDelete.set(null);
          this.toast.success(`"${book.title}" togs bort.`);
        },
        error: (err) => {
          this.bookToDelete.set(null);
          this.toast.error(getErrorMessage(err, 'Kunde inte radera boken.'));
        },
      });
  }
}
