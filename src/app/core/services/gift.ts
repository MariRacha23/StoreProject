import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GiftProduct {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  minPurchaseAmount: number;
}

@Injectable({
  providedIn: 'root',
})
export class Gift {
  private http = inject(HttpClient);
  private apiUrl = 'https://6a0a397821e445625695e20a.mockapi.io/gifts';

  getGifts(): Observable<GiftProduct[]> {
    return this.http.get<GiftProduct[]>(this.apiUrl);
  }
}
