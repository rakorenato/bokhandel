import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Släpper bara in inloggade användare. Andra skickas till inloggningen. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.token
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** För inloggning/registrering: den som redan är inloggad skickas till startsidan. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.token ? router.createUrlTree(['/books']) : true;
};
