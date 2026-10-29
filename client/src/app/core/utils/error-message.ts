import { HttpErrorResponse } from '@angular/common/http';

/**
 * Gör om ett fel från API:t till ett läsbart meddelande på svenska.
 * Hanterar både { message: "..." } och ASP.NET:s valideringsfel { errors: { Fält: ["..."] } }.
 */
export function getErrorMessage(error: unknown, fallback = 'Något gick fel. Försök igen.'): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;

  if (error.status === 0) {
    return 'Kunde inte nå servern. Kontrollera att API:t är igång och försök igen.';
  }

  const body = error.error as Record<string, unknown> | null;

  if (body && typeof body === 'object') {
    const errors = body['errors'];
    if (errors && typeof errors === 'object') {
      const messages = Object.values(errors as Record<string, string[]>).flat();
      if (messages.length) return messages.join(' ');
    }

    const message = body['message'];
    if (typeof message === 'string' && message) return message;
  }

  if (error.status === 404) return 'Det du letade efter finns inte längre.';
  if (error.status >= 500) return 'Serverfel. Försök igen om en liten stund.';

  return fallback;
}
