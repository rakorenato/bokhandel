import { Component, HostListener, input, output } from '@angular/core';

/**
 * Återanvändbar bekräftelseruta (Bootstrap-modal), t.ex. "Vill du radera boken?".
 * Styrs helt av Angular, så Bootstraps JavaScript behövs inte.
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input('Är du säker?');
  readonly confirmText = input('Radera');
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && !this.busy()) this.cancelled.emit();
  }
}
