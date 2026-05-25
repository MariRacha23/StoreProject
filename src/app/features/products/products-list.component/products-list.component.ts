import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ProductService } from '../../../core/services/product-service';
import { Product } from '../../../shared/models/product.interface';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../shared/services/toastService';
import { TranslateModule } from '@ngx-translate/core';
import { Ai } from '../../../core/services/ai';
import { ComparisonServices } from '../../../core/services/comparison-services';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';

@Component({
  selector: 'app-products-list.component',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    MarkdownModule,
  ],
  providers: [provideMarkdown()],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css',
})
export class ProductsListComponent implements OnInit, AfterViewChecked {
  private productService = inject(ProductService);
  private compareService = inject(ComparisonServices);

  private cartService = inject(CartService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private aiService = inject(Ai);
  @ViewChild('scrollMe') private chatContainer!: ElementRef;

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
  public messages = signal<{ role: string; content: string }[]>([]);
  public allProductsForAi = signal<Product[]>([]);
  public isDarkMode = signal(false);

  protected Math = Math;

  public slides = [
    'img/apple-iphone-17-pro-max.webp',
    'img/best-laptops.webp',
    'img/cm26-block-hp-020426_1.avif',
    'img/hq720.jpg',
    'img/iPhone-Pro-Max-feat.webp',
    'img/photo-1491472253230-a044054ca35f.avif',
  ];
  public currentSlide = signal(0);

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchBrands();
    this.loadRecentlyViewed();
    this.loadAllProductsForAi();
    const savedMessages = sessionStorage.getItem('chat_history');
    if (savedMessages) {
      this.messages.set(JSON.parse(savedMessages));
    }
    const savedTheme = sessionStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
      document.body.classList.add('dark-theme');
    }

    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      this.searchQuery.set(value);
      this.loadData(1);
    });
    this.loadData();
    this.startSlider();
  }

  ngAfterViewChecked() {
    if (this.isChatOpen()) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    }
  }

  private startSlider() {
    setInterval(() => {
      this.currentSlide.update((val) => (val + 1) % this.slides.length);
    }, 5000);
  }

  public nextSlide() {
    this.currentSlide.update((val) => (val + 1) % this.slides.length);
  }

  public prevSlide() {
    this.currentSlide.update((val) => (val - 1 + this.slides.length) % this.slides.length);
  }

  private fetchCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => this.toastService.show('Error fetching categories.', 'error'),
    });
  }

  private fetchBrands(): void {
    this.productService.getBrands().subscribe({
      next: (data) => this.brands.set(data),
      error: (err) => this.toastService.show('Error fetching brands.', 'error'),
    });
  }

  private loadAllProductsForAi(): void {
    this.productService.searchProducts('', 1, 50).subscribe({
      next: (res: any) => {
        const all = res.products ? res.products : res;
        this.allProductsForAi.set(all);
      },
      error: (err) => this.toastService.show('Error loading AI data.', 'error'),
    });
  }

  private handleCartError(err: any) {
    this.toastService.show('Cart Error:', err);
    this.toastService.show('Please confirm authorization.', 'error');
    this.router.navigate(['/auth/register']);
  }

  private handleSuccess(title: string, qty: number) {
    this.toastService.show(`${title} (x${qty}) added! 🛒`, 'success');
    this.router.navigate(['/cart']);
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
        error: (err) => this.toastService.show('Error loading products.', 'error'),
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
    if (product.stock === 0) return;

    const productId = product._id;

    this.cartService.getCart().subscribe({
      next: (cart: any) => {
        const cartItems = cart.products || [];

        const existingItem = cartItems.find(
          (item: any) => (item.productId?._id || item.productId || item.id) === productId,
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;
          this.cartService.updateCartItem(productId, newQuantity).subscribe({
            next: () => this.handleSuccess(product.title, newQuantity),
            error: (err) => this.handleCartError(err),
          });
        } else {
          this.cartService.addToCart(productId, 1).subscribe({
            next: () => this.handleSuccess(product.title, 1),
            error: (err) => this.handleCartError(err),
          });
        }
      },
      error: (err) => {
        this.cartService.addToCart(productId, 1).subscribe({
          next: () => this.handleSuccess(product.title, 1),
          error: (addErr) => this.handleCartError(addErr),
        });
      },
    });
  }

  loadRecentlyViewed() {
    const data = sessionStorage.getItem('recentlyViewed');
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

    this.messages.update((prev) => [...prev, { role: 'user', content: text }]);
    this.messages.update((prev) => [...prev, { role: 'assistant', content: 'ვფიქრობ... 🤔' }]);

    const token = sessionStorage.getItem('token');
    const isLoggedInStatus = !!token;

    this.aiService.askCloude(text, this.allProductsForAi(), isLoggedInStatus).subscribe({
      next: (response: string) => {
        let cleanResponse = response;

        const actionRegex = /\[ACTION:\s*ADD_TO_CART\s*,\s*ID:\s*([a-zA-Z0-9_\s,-]+)\]/i;
        const match = response.match(actionRegex);

        if (match && match[1] && match[1].trim()) {
          cleanResponse = response.replace(actionRegex, '').trim();
          const productIds = match[1]
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id.length > 0);

          if (productIds.length === 0) {
            this.fallbackToNormalMessage(cleanResponse);
            return;
          }

          let addCount = 0;
          let hasError = false;

          productIds.forEach((productId) => {
            this.cartService.addToCart(productId, 1).subscribe({
              next: () => {
                addCount++;
                this.cartService.updateCartCount();

                if (addCount === productIds.length) {
                  const cartButtonHtml = `
<br><br>
<a href="/cart" class="btn btn-success d-inline-flex align-items-center gap-2 px-3 py-2 fw-bold shadow-sm" style="text-decoration: none; border-radius: 8px;">
  🛒 გადადი კალათაში საჩუქრის ასარჩევად
</a>`;

                  this.messages.update((prev) => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = {
                      role: 'assistant',
                      content:
                        cleanResponse +
                        `\n\n🎉 პროდუქტი წარმატებით დაემატა თქვენს კალათაში!` +
                        cartButtonHtml,
                    };
                    sessionStorage.setItem('chat_history', JSON.stringify(newMsgs));
                    return newMsgs;
                  });

                  this.toastService.show('პროდუქტი კალათაშია! 🛒', 'success');
                  setTimeout(() => this.scrollToBottom(), 100);
                }
              },
              error: (err) => {
                this.toastService.show('Error adding product to cart.', 'error');
                if (!hasError) {
                  hasError = true;

                  let errorNotice =
                    '\n\n❌ კალათაში დამატება ვერ მოხერხდა. პროდუქტი შესაძლოა მარაგში აღარ არის.';
                  if (err.status === 401) {
                    errorNotice =
                      '\n\n⚠️ შეხსენება: კალათაში დასამატებლად გთხოვთ ჯერ გაიაროთ რეგისტრაცია/ავტორიზაცია ზედა მენიუდან.';
                  }

                  this.messages.update((prev) => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = {
                      role: 'assistant',
                      content: cleanResponse + errorNotice,
                    };
                    return newMsgs;
                  });
                  setTimeout(() => this.scrollToBottom(), 100);
                }
              },
            });
          });
        } else {
          this.fallbackToNormalMessage(cleanResponse);
        }
      },
      error: (err) => {
        this.toastService.show('Error connecting to Claude API.', 'error');
        this.messages.update((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'assistant', content: 'კავშირი გაწყდა 📡' };
          return newMsgs;
        });
        setTimeout(() => this.scrollToBottom(), 100);
      },
    });
  }

  fallbackToNormalMessage(content: string) {
    this.messages.update((prev) => {
      const newMsgs = [...prev];
      newMsgs[newMsgs.length - 1] = { role: 'assistant', content: content };
      sessionStorage.setItem('chat_history', JSON.stringify(newMsgs));
      return newMsgs;
    });
    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendQuickMessage(promptText: string) {
    this.sendMessage(promptText);
  }

  scrollToBottom() {
    if (this.chatContainer) {
      const element = this.chatContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  toggleTheme() {
    this.isDarkMode.update((val) => !val);

    if (this.isDarkMode()) {
      document.body.classList.add('dark-theme');
      sessionStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      sessionStorage.setItem('theme', 'light');
    }
  }

  addToCompare(event: Event, product: any) {
    event.stopPropagation();
    this.compareService.addToCompare(product);
  }

  isInCompare(id: string) {
    return this.compareService.items().some((p) => p._id === id);
  }
}
