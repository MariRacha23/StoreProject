import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../core/services/product-service';
import { Product } from '../../../shared/models/product.interface';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageFallbackPipe } from '../../../shared/pipes/image-fallback-pipe';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../shared/services/toastService';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-products-list.component',
  imports: [CommonModule, RouterModule, FormsModule, ImageFallbackPipe, TranslateModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css',
})
export class ProductsListComponent implements OnInit {
  private productService = inject(ProductService);

  private cartService = inject(CartService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public products = signal<Product[]>([]);
  public currentPage = signal(1);
  public totalProducts = signal(0);
  public pageSize = 9;
  public totalPages = computed(() => Math.ceil(this.totalProducts() / this.pageSize));

  public searchQuery = signal<string>('');
  public minPrice = signal<number | undefined>(undefined);
  public maxPrice = signal<number | undefined>(undefined);
  public rating = signal<number | undefined>(undefined);
  public selectedCategory = signal<string | undefined>(undefined);
  public selectedBrand = signal<string | undefined>(undefined);
  public sortBy = signal<string | undefined>(undefined);
  public sortDirection = signal<'asc' | 'desc' | undefined>(undefined);

  public categories = signal<any[]>([]);
  public brands = signal<string[]>([]);

  public recentlyViewed = signal<Product[]>([]);

  public showRecentlyViewed = signal<boolean>(false);

  public isChatOpen = signal(false);
public messages = signal<{role: string, content: string}[]>([]);

  protected Math = Math;

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchBrands();
    this.loadRecentlyViewed();
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      this.searchQuery.set(value);
      this.loadData(1);
    });
    this.loadData();
  }

  private fetchCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  private fetchBrands(): void {
    this.productService.getBrands().subscribe({
      next: (data) => this.brands.set(data),
      error: (err) => console.error('Error fetching brands:', err),
    });
  }

  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  onSortChange(event: any) {
    const value = event.target.value;
    if (!value) {
      this.sortBy.set(undefined);
      this.sortDirection.set(undefined);
    } else {
      const [field, direction] = value.split('_');
      this.sortBy.set(field);
      this.sortDirection.set(direction as 'asc' | 'desc');
    }
    this.loadData(1);
  }

  loadData(page: number = 1) {
    this.currentPage.set(page);

    const currentSize = this.rating() ? 50 : 9;
    this.productService
      .searchProducts(
        this.searchQuery(),
        page,
        currentSize,
        this.minPrice(),
        this.maxPrice(),
        undefined,
        this.selectedCategory(),
        this.selectedBrand(),
        this.sortBy(),
        this.sortDirection(),
      )
      .subscribe({
        next: (res: any) => {
          let results = res.products ? res.products : res;

          const filterVal = this.rating();
          if (filterVal) {
            results = results.filter((p: any) => {
              const displayedRating = Math.round(p.rating * 10) / 10;
              const rating = Number(displayedRating);

              if (filterVal === 3) {
                return rating >= 3 && rating < 4;
              }
              if (filterVal === 4) {
                return rating >= 4 && rating < 5;
              }
              if (filterVal === 5) {
                return rating >= 5;
              }
              return true;
            });
          }
          this.products.set(results);
          this.totalProducts.set(res.total || results.length);
        },
        error: (err) => console.error('Error:', err),
      });
  }

  setCategory(id: string | undefined) {
    this.selectedCategory.set(id);
    this.loadData(1);
  }

  setBrand(brand: string | undefined) {
    this.selectedBrand.set(brand);
    this.loadData(1);
  }

  filterByCategory(id?: string) {
    this.selectedCategory.set(id);
    this.loadData(1);
  }

  filterByBrand(brand?: string) {
    this.selectedBrand.set(brand);
    this.loadData(1);
  }

  onPriceChange(event: any, type: 'min' | 'max') {
    const value = event.target.value;
    if (type === 'min') this.minPrice.set(value);
    else this.maxPrice.set(value);
    this.loadData(1);
  }

  scrollToProducts() {
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onRatingChange(event: any) {
    const value = event.target.value;

    if (value === '') {
      this.rating.set(undefined);
    } else {
      this.rating.set(Number(value));
    }

    this.loadData(1);
  }

  addToCart(event: Event, product: Product) {
    event.stopPropagation();

    if (product.stock === 0) {
      return;
    }

    const productId = product._id || (product as any).id;

    this.cartService.addToCart(productId, 1).subscribe({
      next: (res: any) => {
        this.toastService.show(`${product.title} added to cart! 🛒`, 'success');
        this.router.navigate(['/cart']);
      },
      error: (err: any) => {
        console.error('Cart Error:', err);
        this.toastService.show('Please login or register to add products to the cart.', 'error');
        this.router.navigate(['/auth/register']);
      },
    });
  }

  loadRecentlyViewed() {
    const data = sessionStorage.getItem('recentlyViewed');
    console.log('Session Data:', data);
    if (data) {
      this.recentlyViewed.set(JSON.parse(data));
    }
  }

  toggleRecentlyViewed(show: boolean) {
    this.showRecentlyViewed.set(show);
  }

  toggleChat() {
  this.isChatOpen.set(!this.isChatOpen());
}

sendMessage(text: string) {
  if (!text.trim()) return;
  
  this.messages.update(prev => [...prev, { role: 'user', content: text }]); 
}


}
