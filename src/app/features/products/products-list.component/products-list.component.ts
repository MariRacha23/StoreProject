import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../core/services/product-service';
import { Product } from '../../../shared/models/product.interface';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-list.component',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css',
})
export class ProductsListComponent implements OnInit {
 private productService = inject(ProductService);

  public products = signal<Product[]>([]);
  public currentPage = signal(1);
  public totalProducts = signal(0);
  public pageSize = 10;

 public totalPages = computed(() => 
    Math.ceil(this.totalProducts() / this.pageSize)
  );

  ngOnInit(): void {
    this.loadPage(this.currentPage()); 
  }

  loadPage(page: number) {
    this.productService.getProducts(page, this.pageSize).subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.totalProducts.set(res.total);
        this.currentPage.set(page);
      },
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  scrollToProducts() {
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  addToCart(event: Event, product: Product) {
    event.stopPropagation();
    alert(`${product.title} added to cart! 🛒`);
  }


 
  public searchQuery = signal<string>('');
public minPrice = signal<number | undefined>(undefined);
  public maxPrice = signal<number | undefined>(undefined);
  public rating = signal<number | undefined>(undefined);

  onSearch() {
    this.productService.searchProducts(
      this.searchQuery(),
      this.minPrice(),
      this.maxPrice(),
      this.rating()
    ).subscribe({
      next: (res: any) => {
        if (res && res.products) {
          this.products.set(res.products);
          this.totalProducts.set(res.total);
        }
      },
      error: (err) => console.error('ფილტრაციის შეცდომა:', err)
    });
  }

}