import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { ProductDto, CreateProductDto, UpdateProductDto } from '@frost-logix/shared-types';
import { HlmButtonImports } from '@frost-logix/ui/button';
import { HlmAlertDialogImports } from '@frost-logix/ui/alert-dialog';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmButtonImports, HlmAlertDialogImports],
  templateUrl: './products.page.html',
  styleUrl: './products.page.css',
})
export class ProductsPage {
  private readonly productsService = inject(ProductsService);

  readonly products = signal<ProductDto[]>([]);
  readonly showForm = signal(false);
  readonly editingProduct = signal<ProductDto | null>(null);

  newProduct: CreateProductDto = { name: '', name_ar: '', unit: 'kg' };
  editForm: UpdateProductDto = { name: '', name_ar: '', unit: 'kg', is_active: true };

  constructor() {
    afterNextRender(() => {
      this.loadProducts();
    });
  }

  toggleForm(): void {
    this.showForm.update((current) => !current);
  }

  loadProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (products) => this.products.set(products),
      error: (error) => console.error('Failed to load products:', error),
    });
  }

  onNewProductNameChange(value: string): void {
    this.newProduct.name = value.trim();
  }

  onEditFormNameChange(value: string): void {
    this.editForm.name = value.trim();
  }

  createProduct(): void {
    const name = this.newProduct.name?.trim();
    if (!name) {
      console.error('Product name is required');
      return;
    }

    this.productsService.createProduct(this.newProduct).subscribe({
      next: (product) => {
        this.products.update((current) => [...current, product]);
        this.resetForm();
        this.showForm.set(false);
      },
      error: (error) => console.error('Failed to create product:', error),
    });
  }

  startEdit(product: ProductDto): void {
    this.editingProduct.set(product);
    this.editForm = {
      name: product.name.trim(),
      name_ar: product.name_ar?.trim() || '',
      unit: product.unit,
      is_active: product.is_active,
    };
  }

  updateProduct(): void {
    const product = this.editingProduct();
    if (!product) return;

    const name = this.editForm.name?.trim();
    if (!name) {
      console.error('Product name is required');
      return;
    }

    const data: UpdateProductDto = {
      name,
      name_ar: this.editForm.name_ar?.trim() || undefined,
      unit: this.editForm.unit || undefined,
      is_active: this.editForm.is_active,
    };

    this.productsService.updateProduct(product.id, data).subscribe({
      next: (updated) => {
        this.products.update((current) => current.map((p) => (p.id === updated.id ? updated : p)));
        this.cancelEdit();
      },
      error: (error) => console.error('Failed to update product:', error),
    });
  }

  cancelEdit(): void {
    this.editingProduct.set(null);
  }

  confirmDelete(productId: string): void {
    this.productsService.deleteProduct(productId).subscribe({
      next: () => {
        this.products.update((current) => current.filter((p) => p.id !== productId));
        if (this.editingProduct()?.id === productId) {
          this.cancelEdit();
        }
      },
      error: (error) => console.error('Failed to delete product:', error),
    });
  }

  private resetForm(): void {
    this.newProduct = { name: '', name_ar: '', unit: 'kg' };
  }
}