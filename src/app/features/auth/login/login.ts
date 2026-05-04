import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/auth/auth';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private authService = inject(Auth);
  public showRecovery = signal(false);

  errorMessage = signal<string | null>(null);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

sendRecovery(email: string) {
  this.authService.recoveryPassword(email).subscribe({
    next: () => {
      alert('Recovery email sent!');
      this.showRecovery.set(false);
    },
    error: (err: any) => alert('Error!')
  });
}

  login() {
  if (this.loginForm.valid) {
    this.authService.signIn(this.loginForm.value).subscribe({
      next: (data: any) => {
        sessionStorage.setItem('user_token', data.access_token);
        
        this.authService.getUserInfo().subscribe(() => {
          alert("Welcome back!");
          this.router.navigate(['/products']);
        });
      },
      error: (err: any) => {
        this.errorMessage.set("Invalid email or password");
      }
    });
  }
}

}
