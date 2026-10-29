import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Lägger till "Authorization: Bearer <token>" på alla anrop till vårt API.
 * Om API:t svarar 401 (token ogiltig eller utgången) loggas användaren ut.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isAuthRequest = req.url.startsWith(`${environment.apiUrl}/auth/`);
  const token = auth.token;

  const request =
    token && isApiRequest
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isApiRequest && !isAuthRequest) {
        auth.logout('expired');
      }
      return throwError(() => error);
    }),
  );
};
