import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  // Startsidan är boklistan
  { path: '', pathMatch: 'full', redirectTo: 'books' },

  // Öppna sidor (bara för den som inte är inloggad)
  {
    path: 'login',
    title: 'Logga in · Bokhandel',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Skapa konto · Bokhandel',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
  },

  // Skyddade sidor (kräver inloggning)
  {
    path: 'books',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        title: 'Böcker · Bokhandel',
        loadComponent: () => import('./pages/books/book-list/book-list').then((m) => m.BookList),
      },
      {
        path: 'new',
        title: 'Ny bok · Bokhandel',
        loadComponent: () => import('./pages/books/book-form/book-form').then((m) => m.BookForm),
      },
      {
        path: ':id/edit',
        title: 'Redigera bok · Bokhandel',
        loadComponent: () => import('./pages/books/book-form/book-form').then((m) => m.BookForm),
      },
    ],
  },
  {
    path: 'quotes',
    title: 'Mina citat · Bokhandel',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/quotes/quote-list/quote-list').then((m) => m.QuoteList),
  },

  {
    path: '**',
    title: 'Sidan finns inte · Bokhandel',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
