import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toastService';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule, ],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  public toastService = inject(ToastService);
  public currentYear = new Date().getFullYear();
  subscribe(email: string) {
    if (email) {
      this.toastService.show(`Thanks for subscribing with: ${email}! 🚀`, 'success');
    }
  }
}
