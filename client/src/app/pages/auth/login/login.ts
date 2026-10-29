import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { getErrorMessage } from '../../../core/utils/error-message';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: '../auth.scss',
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  // Query-parametrar kopplas automatiskt till inputs (withComponentInputBinding)
  readonly returnUrl = input<string>();
  readonly registered = input<string>();
  readonly expired = input<string>();
  readonly username = input<string>();

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly slowServer = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const username = this.username();
    if (username) this.form.controls.username.setValue(username);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Gratis-hosting "somnar" ibland – visa ett lugnande meddelande om det tar tid.
    const slowTimer = setTimeout(() => this.slowServer.set(true), 4000);

    this.auth
      .login(this.form.getRawValue())
      .pipe(
        finalize(() => {
          clearTimeout(slowTimer);
          this.loading.set(false);
          this.slowServer.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          this.toast.success(`Välkommen, ${res.username}!`);
          this.router.navigateByUrl(this.safeReturnUrl());
        },
        error: (err) => this.error.set(getErrorMessage(err, 'Inloggningen misslyckades.')),
      });
  }

  protected isInvalid(name: 'username' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  /** Bara interna adresser, så att ingen kan skicka vidare till en annan sajt. */
  private safeReturnUrl(): string {
    const url = this.returnUrl();
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/books';
  }
}
