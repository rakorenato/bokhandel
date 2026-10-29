import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quote, QuoteRequest } from '../models/quote';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/quotes`;

  getAll(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.api);
  }

  create(quote: QuoteRequest): Observable<Quote> {
    return this.http.post<Quote>(this.api, quote);
  }

  update(id: number, quote: QuoteRequest): Observable<Quote> {
    return this.http.put<Quote>(`${this.api}/${id}`, quote);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
