import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/auth/auth';
import { ToastService } from '../../../shared/services/toastService';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private authService = inject(Auth);
  private toastService = inject(ToastService);
  public showRecovery = signal(false);

  errorMessage = signal<string | null>(null);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  sendRecovery(email: string) {
    this.authService.recoveryPassword(email).subscribe({
      next: () => {
        this.toastService.show('Recovery email sent!', 'success');
        this.showRecovery.set(false);
      },
      error: (err: any) => this.toastService.show('Error!', 'error'),
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.authService.signIn(this.loginForm.value).subscribe({
        next: (data: any) => {
          sessionStorage.setItem('user_token', data.access_token);

          this.authService.getUserInfo().subscribe(() => {
            this.toastService.show('Welcome back!', 'success');
            this.router.navigate(['/products']);
          });
        },
        error: (err: any) => {
          this.errorMessage.set('Invalid email or password');
        },
      });
    }
  }
}
