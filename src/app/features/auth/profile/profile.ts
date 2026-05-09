import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../core/auth/auth';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../shared/services/toastService';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  
  private authService = inject(Auth);
  private router = inject(Router);
  public isEditing = signal(false);
  public message = signal<{ text: string; type: 'success' | 'error' } | null>(null);
public toastService = inject(ToastService);


  public profileForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    age: new FormControl(0, [Validators.required, Validators.min(1)]),
    phone: new FormControl('', Validators.required),
    email: new FormControl({ value: '', disabled: true }),
    address: new FormControl('', Validators.required),
    zipcode: new FormControl('', Validators.required),
    avatar: new FormControl(''),
    gender: new FormControl('MALE'), 
  });

  public passwordForm = new FormGroup({
    oldPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.profileForm.patchValue(user);
      },
      error: (err) => console.error('Error fetching info::', err),
    });
  }

  updateInfo() {
    if (this.profileForm.valid) {
      this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
        next: (res) => {
          this.message.set({ text: 'Profile updated successfully!', type: 'success' });
          this.isEditing.set(false);
        },
        error: (err: any) => this.message.set({ text: 'Update failed', type: 'error' }),
      });
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      this.authService.changePassword(this.passwordForm.value).subscribe({
        next: () => {
          this.message.set({ text: 'Password changed!', type: 'success' });
          this.passwordForm.reset();
        },
        error: (err: any) => this.message.set({ text: 'Failed to change password', type: 'error' }),
      });
    }
  }

  sendRecoveryEmail() {
  const email = this.profileForm.getRawValue().email;
  if (email) {
    this.authService.recoveryPassword(email as string).subscribe({
      next: () => this.toastService.show('Recovery email sent!', 'success'),
      error: () => this.toastService.show('Error!', 'error')
    });
  }
}

deleteMyAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone! 😱')) {
    this.authService.deleteAccount().subscribe({
      next: () => {
       this.toastService.show('Account deleted successfully. We will miss you!', 'info');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.toastService.show('Failed to delete account. Please try again.', 'error');
        console.error(err);
      }
    });
  }
}

logout() {
  this.authService.singOut().subscribe({
    next: () => this.router.navigate(['/auth/login'])
  });
}


}
