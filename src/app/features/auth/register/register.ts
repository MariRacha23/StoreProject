import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/auth/auth';
import { ToastService } from '../../../shared/services/toastService';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
private authService = inject(Auth);
  private router = inject(Router);
  private toastService = inject(ToastService);

 public registerForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    age: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    address: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    zipcode: new FormControl('', Validators.required),
    avatar: new FormControl('https://goo.su/m69vH'), 
    gender: new FormControl('MALE'),
  });

  register() {
    if (this.registerForm.valid) {
      this.authService.signUp(this.registerForm.value).subscribe({
        next: (data: any) => {
          this.toastService.show('Registration successful!', 'success');
          this.router.navigate(['/auth/login']);
        },
        error: (err: any) => this.toastService.show('Registration failed!', 'error')
      });
    }
  }
}
