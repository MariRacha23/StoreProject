import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  public currentYear = new Date().getFullYear();
  subscribe(email: string) {
    if (email) {
      alert(`Thanks for subscribing with: ${email}! 🚀`);
    }
  }
}
