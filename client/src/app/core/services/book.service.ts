import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, BookRequest } from '../models/book';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/books`;

  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.api);
  }

  getById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.api}/${id}`);
  }

  create(book: BookRequest): Observable<Book> {
    return this.http.post<Book>(this.api, book);
  }

  update(id: number, book: BookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.api}/${id}`, book);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
