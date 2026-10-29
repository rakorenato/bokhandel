import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Credentials, MessageResponse } from '../models/auth';

const STORAGE_KEY = 'bokhandel.auth';

/**
 * Sköter inloggning, registrering och lagring av JWT-token.
 *
 * Token sparas i localStorage så att man förblir inloggad när sidan laddas om.
 * Den skickas sedan med i varje API-anrop av authInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = `${environment.apiUrl}/auth`;

  private readonly session = signal<AuthResponse | null>(this.readStoredSession());
  private logoutTimer?: ReturnType<typeof setTimeout>;

  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly username = computed(() => this.session()?.username ?? null);

  constructor() {
    const current = this.session();
    if (current) this.scheduleAutoLogout(current.expiresAt);
  }

  /** Giltig token, eller null om man inte är inloggad / token har gått ut. */
  get token(): string | null {
    const current = this.session();
    if (!current) return null;

    if (this.isExpired(current.expiresAt)) {
      this.clearSession();
      return null;
    }
    return current.token;
  }

  register(credentials: Credentials): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.api}/register`, credentials);
  }

  login(credentials: Credentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, credentials)
      .pipe(tap((response) => this.saveSession(response)));
  }

  logout(reason: 'manual' | 'expired' = 'manual'): void {
    const wasLoggedIn = this.session() !== null;
    this.clearSession();

    if (reason === 'expired' && wasLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { expired: 1 } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  // ---------- Privata hjälpmetoder ----------

  private saveSession(response: AuthResponse): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    } catch {
      // localStorage kan vara avstängt (t.ex. privat läge). Då gäller inloggningen bara tills sidan laddas om.
    }
    this.session.set(response);
    this.scheduleAutoLogout(response.expiresAt);
  }

  private clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignoreras */
    }
    clearTimeout(this.logoutTimer);
    this.session.set(null);
  }

  private readStoredSession(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const stored = JSON.parse(raw) as AuthResponse;
      if (!stored.token || this.isExpired(stored.expiresAt)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return stored;
    } catch {
      return null;
    }
  }

  private isExpired(expiresAt: string): boolean {
    return new Date(expiresAt).getTime() <= Date.now();
  }

  /** Loggar ut automatiskt när token går ut. */
  private scheduleAutoLogout(expiresAt: string): void {
    clearTimeout(this.logoutTimer);
    const msLeft = new Date(expiresAt).getTime() - Date.now();

    // setTimeout klarar max ~24 dagar, så vi begränsar för säkerhets skull.
    if (msLeft > 0 && msLeft < 2_147_000_000) {
      this.logoutTimer = setTimeout(() => this.logout('expired'), msLeft);
    }
  }
}
