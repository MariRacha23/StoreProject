import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product-service';
import { switchMap } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';

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

  public product = signal<any>(null);
  public selectedImage = signal<string>('');
  public quantity = signal<number>(1);
  public errorMessage = false;

  addToCart() {
    const currentProduct = this.product();
    console.log('Full Product Object:', currentProduct);

    if (currentProduct) {
      const id = currentProduct._id || currentProduct.id;
      const qty = this.quantity();

      if (!id) {
        console.error('ID is missing!');
        return;
      }

      this.cartService.addToCart(id, qty).subscribe({
        next: (res: any) => {
          alert('Product added! 🛒');
          this.router.navigate(['/cart']);
        },
        error: (err: any) => alert('Error: ' + err.status),
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
}
