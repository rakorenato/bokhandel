import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast show align-items-center border-0 text-bg-{{ toast.type }}" role="status">
          <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2">
              <i class="fa-solid {{ icon(toast.type) }}"></i>
              <span>{{ toast.message }}</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto"
                    aria-label="Stäng" (click)="toastService.dismiss(toast.id)"></button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-container { z-index: 1090; }
    .toast { animation: slide-in 0.2s ease-out; max-width: calc(100vw - 2rem); }
    @keyframes slide-in { from { opacity: 0; transform: translateY(10px); } }
  `,
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);

  protected icon(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'fa-circle-check';
      case 'danger':
        return 'fa-circle-exclamation';
      default:
        return 'fa-circle-info';
    }
  }
}
