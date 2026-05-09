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

@Component({
  selector: 'app-products-list.component',
  imports: [CommonModule, RouterModule, FormsModule, ImageFallbackPipe],
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

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchBrands();
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      this.searchQuery.set(value);
      this.loadData(1);
    });
    this.loadData(); 
  }


private fetchCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  private fetchBrands(): void {
    this.productService.getBrands().subscribe({
      next: (data) => this.brands.set(data),
      error: (err) => console.error('Error fetching brands:', err)
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

    this.productService
      .searchProducts(
        this.searchQuery(),
        page,
        this.pageSize,
        this.minPrice(),
        this.maxPrice(),
        this.rating(),
        this.selectedCategory(),
        this.selectedBrand(),
        this.sortBy(),
        this.sortDirection(),
      )
      .subscribe({
        next: (res: any) => {
          const results = res.products ? res.products : res;
          this.products.set(results);
          this.totalProducts.set(res.total || 0);
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
}
