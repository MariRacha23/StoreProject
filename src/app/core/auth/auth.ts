import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.everrest.educata.dev/auth';

  public currentUser = signal<any>(null);

  constructor() {
    const token = sessionStorage.getItem('user_token');
    if (token) {
      this.getUserInfo().subscribe();
    }
  }

  private getHeaders() {
    const token = sessionStorage.getItem('user_token');
    return { Authorization: `Bearer ${token}` };
  }

  signUp(info: any) {
    return this.http.post(`${this.baseUrl}/sign_up`, info);
  }

  signIn(info: any) {
    return this.http.post(`${this.baseUrl}/sign_in`, info).pipe(
      tap((res: any) => {
        sessionStorage.setItem('user_token', res.access_token);
        sessionStorage.setItem('refresh_token', res.refresh_token);
      }),
    );
  }

  singOut() {
    return this.http.post(`${this.baseUrl}/sign_out`, {}, { headers: this.getHeaders() }).pipe(
      tap(() => {
        sessionStorage.clear();
        this.currentUser.set(null);
      }),
    );
  }

  deleteAccount() {
    return this.http.delete(`${this.baseUrl}/delete`, { headers: this.getHeaders() }).pipe(
      tap(() => {
        sessionStorage.clear();
        this.currentUser.set(null);
      }),
    );
  }

  refreshToken() {
    const refresh_token = sessionStorage.getItem('refresh_token');
    return this.http.post(`${this.baseUrl}/refresh`, { refresh_token }).pipe(
      tap((res: any) => {
        sessionStorage.setItem('user_token', res.access_token);
      }),
    );
  }

  verifyEmail(code: string) {
    return this.http.post(`${this.baseUrl}/verify_email`, { code }, { headers: this.getHeaders() });
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/update`, userData, { headers: this.getHeaders() });
  }

  recoveryPassword(email: string) {
    return this.http.post(`${this.baseUrl}/recovery`, { email });
  }

  changePassword(passwordData: any) {
    return this.http
      .patch(`${this.baseUrl}/change_password`, passwordData, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((res: any) => {
          if (res.access_token) {
            sessionStorage.setItem('user_token', res.access_token);
          }
        }),
      );
  }

  getUserInfo() {
    return this.http
      .get(`${this.baseUrl}`, { headers: this.getHeaders() })
      .pipe(tap((user) => this.currentUser.set(user)));
  }
}
