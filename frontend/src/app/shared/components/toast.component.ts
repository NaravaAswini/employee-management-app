import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border transition-all duration-300 transform translate-y-0"
          [ngClass]="{
            'bg-emerald-50 border-emerald-200 text-emerald-900': toast.type === 'success',
            'bg-rose-50 border-rose-200 text-rose-900': toast.type === 'error',
            'bg-amber-50 border-amber-200 text-amber-900': toast.type === 'warning',
            'bg-indigo-50 border-indigo-200 text-indigo-900': toast.type === 'info'
          }"
        >
          <!-- Icon -->
          <div class="flex-shrink-0 mt-0.5">
            @if (toast.type === 'success') {
              <span class="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
            } @else if (toast.type === 'error') {
              <span class="material-symbols-outlined text-rose-600 text-xl">error</span>
            } @else if (toast.type === 'warning') {
              <span class="material-symbols-outlined text-amber-600 text-xl">warning</span>
            } @else {
              <span class="material-symbols-outlined text-indigo-600 text-xl">info</span>
            }
          </div>

          <!-- Content -->
          <div class="flex-1 text-sm">
            @if (toast.title) {
              <p class="font-semibold leading-5 mb-0.5">{{ toast.title }}</p>
            }
            <p class="text-xs sm:text-sm leading-5 opacity-90">{{ toast.message }}</p>
          </div>

          <!-- Dismiss button -->
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="flex-shrink-0 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-black/5"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
