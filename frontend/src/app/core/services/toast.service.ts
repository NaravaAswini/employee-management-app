import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private counter = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  show(type: ToastMessage['type'], message: string, title?: string, duration = 4000) {
    const id = ++this.counter;
    const toast: ToastMessage = { id, type, title, message };

    this.toasts.update(current => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, title = 'Success') {
    this.show('success', message, title);
  }

  error(message: string, title = 'Error') {
    this.show('error', message, title);
  }

  info(message: string, title = 'Notice') {
    this.show('info', message, title);
  }

  warning(message: string, title = 'Warning') {
    this.show('warning', message, title);
  }

  dismiss(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
