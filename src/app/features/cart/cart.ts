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
        if (!res || !res.products || res.products.length === 0) {
          this.cartData.set({ products: [] });
          return;
        }

        const requests = res.products.map((item: any) => {
          return this.ProductService.getProductById(item.productId).pipe(
            map((fullProduct) => ({
              ...item,
              product: fullProduct,
            })),
          );
        });

        forkJoin(requests).subscribe({
          next: (enrichedProducts) => {
            this.cartData.set({
              ...res,
              products: enrichedProducts,
            });
            console.log('Cart updated successfully');
          },
          error: (err) => console.error('Error enriching products:', err),
        });
      },
      error: (err) => {
        console.error('Cart fetch failed:', err);
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

  changeQuantity(productId: string, currentQty: number, delta: number) {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    console.log('Sending update for:', productId, 'New Qty:', newQty);

    this.cartService.updateQuantity(productId, newQty).subscribe({
      next: () => {
        this.refreshCart();
        this.cartService.updateCartCount();
      },
      error: (err) => console.error('Update failed:', err),
    });
  }

  onCheckout() {
    if (confirm('Are you sure you want to complete the purchase?')) {
      this.cartService.checkout().subscribe({
        next: () => {
          alert('Thank you for your purchase! 🛍️');

          this.cartData.set({ products: [] });

          this.cartService.updateCartCount();
        },
        error: (err) => {
          console.error('Checkout failed:', err);
          alert('Checkout failed. Please try again.');
        },
      });
    }
  }
}
