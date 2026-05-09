import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public toast = signal<Toast | null>(null);

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3000);
  }
}
