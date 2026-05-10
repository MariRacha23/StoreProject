import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product-service';
import { switchMap } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../shared/services/toastService';
import { Product } from '../../../shared/models/product.interface';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  public product = signal<any>(null);
  public selectedImage = signal<string>('');
  public quantity = signal<number>(1);
  public errorMessage = false;
  public userSelectedRating = signal<number>(0);

  addToCart() {
    const currentProduct = this.product();

    if (currentProduct) {
      const id = currentProduct._id || currentProduct.id;
      const qty = this.quantity();
      this.cartService.addToCart(id, qty).subscribe({
        next: (res: any) => {
          this.toastService.show('Product added to cart! 🛒', 'success');
          this.router.navigate(['/cart']);
        },
        error: (err: any) => {
          console.error('Cart Error:', err);
          this.toastService.show('You need to be registered to add products to the cart.', 'error');
          this.router.navigate(['/auth/register']);
        },
      });
    }
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const id = params['id'];
          this.product.set(null);
          return this.productService.getProductById(id);
        }),
      )
      .subscribe({
        next: (res) => {
          this.product.set(res);
          this.selectedImage.set(res.thumbnail);
          this.errorMessage = false;

          this.addToRecentlyViewed(res);
        },
        error: (err) => {
          console.error('Fetch Error:', err);
          this.errorMessage = true;
        },
      });
  }

  selectImage(imgUrl: string) {
    this.selectedImage.set(imgUrl);
  }

  updateQuantity(val: number) {
    const newQty = this.quantity() + val;
    const maxStock = this.product()?.stock || 1;
    if (newQty >= 1 && newQty <= maxStock) {
      this.quantity.set(newQty);
    }
  }

  submitRating(rating: number) {
    const currentProduct = this.product();
    if (!currentProduct) return;

    this.productService.rateProduct(currentProduct._id, rating).subscribe({
      next: (res) => {
        console.log('Server Response:', res);
        this.userSelectedRating.set(rating);
        this.toastService.show(
          'Thank you! Your rating has been submitted successfully. ⭐',
          'success',
        );
      },
      error: (err) => {
        console.log('Error details:', err);

        if (err.status === 401 || err.status === 400) {
          this.toastService.show('Please login or register to rate this product.', 'error');
          this.router.navigate(['/auth/register']);
        } else {
          this.toastService.show('Failed to submit rating. Please try again later.', 'error');
        }
      },
    });
  }

  addToRecentlyViewed(product: Product) {
    const viewed = JSON.parse(sessionStorage.getItem('recentlyViewed') || '[]');
    const filtered = viewed.filter((p: any) => p._id !== product._id);

    filtered.unshift(product);
    const limited = filtered.slice(0, 5);
    sessionStorage.setItem('recentlyViewed', JSON.stringify(limited));
  }
}
