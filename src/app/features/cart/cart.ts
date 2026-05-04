import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { forkJoin, map } from 'rxjs';
import { ProductService } from '../../core/services/product-service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private cartService = inject(CartService);
  private ProductService = inject(ProductService);
  public cartData = signal<any>(null);

  ngOnInit(): void {
    this.refreshCart();
  }

  refreshCart() {
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (!res.products || res.products.length === 0) {
          this.cartData.set(res);
          return;
        }

        const requests = res.products.map((item: any) => {
          return this.ProductService.getProductById(item.productId).pipe(
            map((fullProduct) => {
              return {
                ...item,
                product: fullProduct,
              };
            }),
          );
        });

        forkJoin(requests).subscribe((enrichedProducts) => {
          this.cartData.set({
            ...res,
            products: enrichedProducts,
          });
          console.log('Enriched Cart Content:', enrichedProducts);
        });
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.cartData.set(null);
      },
    });
  }

  removeItem(productId: string) {
    if (!productId) return;

    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        console.log('Item removed successfully');
        this.refreshCart();

        this.cartService.updateCartCount();
      },
      error: (err) => console.error('Delete error:', err),
    });
  }
}
