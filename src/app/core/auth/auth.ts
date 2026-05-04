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

  signUp(info: any) {
    return this.http.post(`${this.baseUrl}/sign_up`, info);
  }

 signIn(info: any) {
    return this.http.post(`${this.baseUrl}/sign_in`, info).pipe(
      tap((res: any) => {
        this.currentUser.set(res.user); 
        sessionStorage.setItem("user_token", res.access_token);
      })
    );
  }

  updateProfile(userData: any): Observable<any> {
  const token = sessionStorage.getItem('user_token');
  return this.http.patch(`${this.baseUrl}/update`, userData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

 recoveryPassword(email: string) {
  return this.http.post(`${this.baseUrl}/recovery`, { email });
}

changePassword(passwordData: any) {
  const token = sessionStorage.getItem('user_token');
  return this.http.patch(`${this.baseUrl}/change_password`, passwordData, {
    headers: { Authorization: `Bearer ${token}` }
  }).pipe(
    tap((res: any) => {
      if (res.access_token) {
        sessionStorage.setItem("user_token", res.access_token); 
      }
    })
  );
}

getUserInfo() {
  const token = sessionStorage.getItem('user_token');
  return this.http.get(`${this.baseUrl}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).pipe(
    tap((user) => this.currentUser.set(user))
  );
}
}
