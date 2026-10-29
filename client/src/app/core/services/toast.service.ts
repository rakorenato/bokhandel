import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

/** Små notiser i hörnet, t.ex. "Boken sparades". */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'danger', 6000);
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private show(message: string, type: ToastType, duration = 3500): void {
    const toast: Toast = { id: this.nextId++, message, type };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }
}
