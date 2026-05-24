import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../shared/models/product.interface';
import { Api } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private api = inject(Api);

  private baseUrl = 'https://api.everrest.educata.dev/shop/products';
  private subPath = 'products';

  getProducts(pageIndex: number = 1, pageSize: number = 10): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page_index', pageIndex.toString())
      .set('page_size', pageSize.toString());
    return this.api.get<ProductResponse>(`${this.subPath}/all`, params);
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

    if (query && query.trim() !== '') params = params.set('keywords', query);
    if (minPrice) params = params.set('price_min', minPrice.toString());
    if (maxPrice) params = params.set('price_max', maxPrice.toString());
    if (rating !== undefined && rating !== null) params = params.set('rating', rating.toString());
    if (category_id) params = params.set('category_id', category_id);
    if (brand) params = params.set('brand', brand.toLowerCase());
    if (sortBy) params = params.set('sort_by', sortBy);
    if (sortDirection) params = params.set('sort_direction', sortDirection);

    return this.api.get<any>(`${this.subPath}/search`, params);
  }

  getProductById(id: string): Observable<any> {
    return this.api.get<any>(`${this.subPath}/id/${id}`);
  }

  getCategories(): Observable<any[]> {
    return this.api.get<any[]>(`${this.subPath}/categories`);
  }

  getBrands(): Observable<string[]> {
    return this.api.get<string[]>(`${this.subPath}/brands`);
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

  addProduct(data: any): Observable<any> {
    const token = sessionStorage.getItem('user_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(this.baseUrl, data, { headers });
  }

  deleteProduct(id: string): Observable<any> {
    const token = sessionStorage.getItem('user_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { headers });
  }
}
