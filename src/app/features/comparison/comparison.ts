import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ComparisonServices } from '../../core/services/comparison-services';
import { CartService } from '../../core/services/cart.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toastService';
import { Product } from '../../shared/models/product.interface';

@Component({
  selector: 'app-comparison',
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './comparison.html',
  styleUrl: './comparison.css',
})
export class Comparison {
  public compareService = inject(ComparisonServices);
  private cartService = inject(CartService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  addToCart(product: Product) {
    this.cartService.addToCart(product._id, 1).subscribe({
      next: (response) => {
        this.cartService.updateCartCount();
        this.toastService.show('Product added to cart! 🛒', 'success');
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        this.toastService.show('Add to cart error:', err);

        if (err.status === 401 || err.status === 400) {
          this.toastService.show('You need to be registered to add products to the cart.', 'error');
          this.router.navigate(['/auth/register']);
        } else {
          this.toastService.show('Failed to add product to cart. Please try again later.', 'error');
        }
      },
    });
  }
}
