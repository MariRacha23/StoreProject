import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../core/auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService = inject(Auth);

  public isEditing = signal(false);
  public message = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  public profileForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    email: new FormControl({ value: '', disabled: true }),
    address: new FormControl('', Validators.required),
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
      error: (err) => console.error('შეცდომა მონაცემების წამოღებისას:', err),
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
      next: () => alert('Recovery email sent!'),
      error: () => alert('Error!')
    });
  }
}
}
