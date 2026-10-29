import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../core/utils/error-message';

/** Kontrollerar att "Upprepa lösenord" matchar lösenordet. */
const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../auth.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group(
    {
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly error = signal<string | null>(null);

  protected get c() {
    return this.form.controls;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { username, password } = this.form.getRawValue();

    this.auth
      .register({ username: username.trim(), password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        // Efter registrering skickas man till inloggningen med användarnamnet ifyllt.
        next: () =>
          this.router.navigate(['/login'], {
            queryParams: { registered: 1, username: username.trim() },
          }),
        error: (err) => this.error.set(getErrorMessage(err, 'Registreringen misslyckades.')),
      });
  }

  protected showError(name: 'username' | 'password' | 'confirmPassword'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected get mismatch(): boolean {
    return this.form.hasError('passwordMismatch') && this.c.confirmPassword.touched;
  }
}
