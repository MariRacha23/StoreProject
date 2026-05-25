import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { ToastService } from '../../shared/services/toastService';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private apiUrl = 'https://api.everrest.educata.dev/shop/cart';

  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  private getHeaders() {
    const token = sessionStorage.getItem('user_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  addToCart(id: string, quantity: number): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/product`, { id, quantity }, { headers: this.getHeaders() })
      .pipe(
        catchError((err) => {
          if (err.status === 400) {
            return this.updateCartItem(id, quantity);
          }
          throw err;
        }),
        tap(() => this.updateCartCount()),
      );
  }

  updateCartItem(id: string, quantity: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/product`,
      { id, quantity },
      { headers: this.getHeaders() },
    );
  }

  getCart(): Observable<any> {
    const token = sessionStorage.getItem('user_token');
    if (!token) {
      return of({ products: [] });
    }
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  removeFromCart(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/product`, {
        headers: this.getHeaders(),
        body: { id: id },
      })
      .pipe(tap(() => this.updateCartCount()));
  }

  updateCartCount() {
    const token = sessionStorage.getItem('user_token');
    if (!token) {
      this.cartCount.next(0);
      return;
    }
    this.getCart().subscribe({
      next: (cart: any) => {
        const totalItems = cart.products?.length || 0;
        this.cartCount.next(totalItems);
      },
      error: (err) => {
        this.toastService.show('Error fetching cart for count.', 'error');
        this.cartCount.next(0);
      },
    });
  }

  updateQuantity(productId: string, quantity: number): Observable<any> {
    const body = {
      id: productId,
      quantity: Number(quantity),
    };
    return this.http.patch(`${this.apiUrl}/product`, body, { headers: this.getHeaders() });
  }

  checkout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, {}, { headers: this.getHeaders() });
  }
  resetCartCount() {
    this.cartCount.next(0);
  }


}
