import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { forkJoin, map } from 'rxjs';
import { ProductService } from '../../core/services/product-service';
import { Gift, GiftProduct } from '../../core/services/gift';
import { ToastService } from '../../shared/services/toastService';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  providers: [Gift],
})
export class Cart implements OnInit {
  private cartService = inject(CartService);
  private ProductService = inject(ProductService);
  private giftService = inject(Gift);
  private toastService = inject(ToastService);

  public cartData = signal<any>(null);
  public availableGifts = signal<GiftProduct[]>([]);
  public selectedGift = signal<GiftProduct | null>(null);
  public totalCartAmount = signal<number>(0);

  public purchasedProducts = signal<any[]>([]);

  ngOnInit(): void {
    this.refreshCart();

    const savedPurchases = sessionStorage.getItem('purchased_items');
    if (savedPurchases) {
      this.purchasedProducts.set(JSON.parse(savedPurchases));
    }
  }

  loadGifts(): void {
    this.giftService.getGifts().subscribe({
      next: (gifts) => {
        const filtered = gifts.filter((g) => this.totalCartAmount() >= g.minPurchaseAmount);

        this.availableGifts.set(filtered.slice(0, 4));
      },
      error: (err) => this.toastService.show('Failed to load gifts.', 'error'),
    });
  }

  selectGift(gift: GiftProduct): void {
    this.selectedGift.set(gift);
  }

  refreshCart() {
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (!res || !res.products || res.products.length === 0) {
          this.cartData.set({ products: [] });
          this.totalCartAmount.set(0);
          this.availableGifts.set([]);
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
          next: (enrichedProducts: unknown) => {
            const productsArray = enrichedProducts as any[];

            this.cartData.set({
              ...res,
              products: productsArray,
            });

            const total = productsArray.reduce((sum: number, item: any) => {
              const price = item.product?.price?.current || 0;
              return sum + price * item.quantity;
            }, 0);

            this.totalCartAmount.set(total);

            this.loadGifts();
          },
          error: (err) => {
            this.toastService.show('Failed to enrich products.', 'error');
          },
        });
      },
      error: (err) => {
        this.toastService.show('Failed to fetch cart.', 'error');
      },
    });
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id).subscribe({
      next: () => {
        this.refreshCart();
      },
      error: (err) => this.toastService.show('Failed to remove item.', 'error'),
    });
  }

  changeQuantity(id: string, currentQty: number, change: number) {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    this.cartService.updateQuantity(id, newQty).subscribe({
      next: () => {
        this.refreshCart();
      },
      error: (err) => this.toastService.show('Failed to update quantity.', 'error'),
    });
  }

  onCheckout() {
    const currentCartProducts = this.cartData()?.products || [];
    const chosenGift = this.selectedGift();

    if (currentCartProducts.length === 0 && !chosenGift) return;

    if (confirm('Are you sure you want to complete the purchase?')) {
      this.cartService.checkout().subscribe({
        next: () => {
          alert('Thank you for your purchase! 🛍️');

          const savedPurchases = sessionStorage.getItem('purchased_items');
          const newPurchases = savedPurchases ? JSON.parse(savedPurchases) : [];
          const today = new Date().toLocaleDateString();

          currentCartProducts.forEach((item: any) => {
            if (item.product) {
              const singlePrice = Number(item.product.price?.current || item.product.price || 0);
              const totalPrice = singlePrice * Number(item.quantity);

              newPurchases.push({
                id: item.productId || item.product._id,
                title: item.product.title,
                thumbnail: item.product.images?.[0],
                price: totalPrice,
                singlePrice: singlePrice,
                quantity: item.quantity,
                purchaseDate: today,
                isGift: false,
              });
            }
          });

          if (chosenGift) {
            newPurchases.push({
              id: chosenGift.id || (chosenGift as any)._id || 'gift_' + Date.now(),
              title: `🎁 Gift: ${chosenGift.title}`,
              thumbnail:
                (chosenGift as any).thumbnail ||
                'https://cdn-icons-png.flaticon.com/512/2279/2279413.png',
              price: 0,
              quantity: 1,
              purchaseDate: today,
              isGift: true,
            });
          }

          sessionStorage.setItem('purchased_items', JSON.stringify(newPurchases));
          this.purchasedProducts.set(newPurchases);

          this.selectedGift.set(null);
          this.cartData.set({ products: [] });
          this.totalCartAmount.set(0);
          this.availableGifts.set([]);

          this.cartService.resetCartCount();
        },
        error: (err) => {
          this.toastService.show('Checkout failed. Please try again.', 'error');
        },
      });
    }
  }
}
