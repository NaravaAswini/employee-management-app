import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" (click)="onCancel()"></div>

        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-100 p-6">
            <div class="sm:flex sm:items-start gap-4">
              <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 sm:mx-0">
                <span class="material-symbols-outlined text-rose-600 text-2xl">delete_forever</span>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:text-left flex-1">
                <h3 class="text-lg font-bold text-slate-900" id="modal-title">{{ title }}</h3>
                <div class="mt-2">
                  <p class="text-sm text-slate-600">{{ message }}</p>
                </div>
              </div>
            </div>

            <div class="mt-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                (click)="onConfirm()"
                [disabled]="isLoading"
                class="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 sm:w-auto disabled:opacity-50"
              >
                @if (isLoading) {
                  <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                }
                {{ confirmText }}
              </button>
              <button
                type="button"
                (click)="onCancel()"
                [disabled]="isLoading"
                class="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Deletion';
  @Input() message = 'Are you sure you want to delete this item? This action cannot be undone.';
  @Input() confirmText = 'Delete';
  @Input() isLoading = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
