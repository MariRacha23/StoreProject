import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../shared/services/toastService';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  public isModalOpen = signal(false);
  public products = signal<any[]>([]);

  public productForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    price: new FormControl(null, [Validators.required, Validators.min(1)]),
    brand: new FormControl('', Validators.required),
    stock: new FormControl(1, [Validators.required, Validators.min(1)]),
    categoryID: new FormControl('', Validators.required),
    image: new FormControl('', Validators.required),
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        const productList = Array.isArray(res) ? res : res.products || res.data || [];
        this.products.set(productList);
      },
      error: (err) => {
        this.toastService.show('Failed to load products from server.', 'error');
      },
    });
  }

  toggleModal() {
    this.isModalOpen.set(!this.isModalOpen());
    if (!this.isModalOpen()) {
      this.productForm.reset({
        stock: 1,
        price: null,
        title: '',
        description: '',
        brand: '',
        categoryID: '',
        image: '',
      });
    }
  }

  submitProduct() {
    if (this.productForm.valid) {
      const rawValue = this.productForm.getRawValue();

      const mockProduct = {
        _id: 'mock_' + Math.random().toString(36).substring(2, 9),
        title: rawValue.title,
        description: rawValue.description,
        price: Number(rawValue.price),
        brand: rawValue.brand || 'No Brand',
        stock: Number(rawValue.stock) || 1,
        category: { _id: rawValue.categoryID, name: 'Mock Category' },
        images: [rawValue.image],
        thumbnail: rawValue.image,
      };

      this.products.set([mockProduct, ...this.products()]);
      this.toastService.show('Product added successfully! (Mock Mode)', 'success');
      this.toggleModal();
    } else {
      this.toastService.show('Please fill in all required fields correctly.', 'error');

      Object.keys(this.productForm.controls).forEach((key) => {
        const controlErrors = this.productForm.get(key)?.errors;
        if (controlErrors) this.toastService.show(`Field error: ${key}`, 'error');
      });
    }
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedList = this.products().filter((product) => product._id !== id);
      this.products.set(updatedList);
      this.toastService.show('Product deleted successfully! (Mock Mode)', 'success');
    }
  }
}
