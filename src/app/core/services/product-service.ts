import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ProductResponse } from '../../shared/models/product.interface';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

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

  searchProducts(
    query: string = '',
    pageIndex: number = 1,
    pageSize: number = 10,
    minPrice?: number,
    maxPrice?: number,
    rating?: number,
    category_id?: string,
    brand?: string,
    sortBy?: string,
    sortDirection?: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page_index', pageIndex.toString())
      .set('page_size', pageSize.toString());

    if (query && query.trim() !== '') {
      params = params.set('keywords', query);
    }

    if (minPrice) params = params.set('price_min', minPrice.toString());
    if (maxPrice) params = params.set('price_max', maxPrice.toString());
    if (rating) params = params.set('rating', rating.toString());
    if (category_id) params = params.set('category_id', category_id);
    if (brand) params = params.set('brand', brand.toLowerCase());
    if (sortBy) params = params.set('sort_by', sortBy);
    if (sortDirection) params = params.set('sort_direction', sortDirection);

    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/id/${id}`);
  }

  rateProduct(productId: string, rating: number): Observable<any> {
    const token = sessionStorage.getItem('user_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body = {
      productId: productId,
      rate: Number(rating),
    };

    return this.http.post(`${this.baseUrl}/rate`, body, { headers });
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/brands`);
  }
}
