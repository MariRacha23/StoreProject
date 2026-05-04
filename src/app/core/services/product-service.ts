import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ProductResponse } from '../../shared/models/product.interface';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.everrest.educata.dev/shop/products';

  getProducts(pageIndex: number = 1, pageSize: number = 10): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page_index', pageIndex.toString())
      .set('page_size', pageSize.toString());
    return this.http.get<ProductResponse>(`${this.baseUrl}/all`, { params });
  }

  searchProducts(query: string, minPrice?: number, maxPrice?: number, rating?: number) {
    let params = new HttpParams().set('keywords', query);
    if (minPrice) params = params.set('price_min', minPrice.toString());
    if (maxPrice) params = params.set('price_max', maxPrice.toString());
    if (rating) params = params.set('rating', rating.toString());

    return this.http.get<any[]>(`${this.baseUrl}/search`, { params });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/id/${id}`);
  }
}
