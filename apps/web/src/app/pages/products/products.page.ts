import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { ProductDto, CreateProductDto, UpdateProductDto } from '@frost-logix/shared-types';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">المنتجات</h1>
        <button
          (click)="showForm.set(!showForm())"
          class="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          {{ showForm() ? 'إلغاء' : 'إضافة منتج' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">إضافة منتج جديد</h2>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium">الاسم</label>
              <input
                [(ngModel)]="newProduct.name"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="اسم المنتج"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الاسم بالعربية</label>
              <input
                [(ngModel)]="newProduct.name_ar"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="اسم المنتج بالعربية"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الوحدة</label>
              <select
                [(ngModel)]="newProduct.unit"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                <option value="kg">كيلو</option>
                <option value="piece">قطعة</option>
                <option value="box">صندوق</option>
              </select>
            </div>
          </div>
          <button
            (click)="createProduct()"
            class="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            حفظ
          </button>
        </div>
      }

      @if (editingProduct()) {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">تعديل منتج</h2>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium">الاسم</label>
              <input
                [(ngModel)]="editForm.name"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="اسم المنتج"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الاسم بالعربية</label>
              <input
                [(ngModel)]="editForm.name_ar"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="اسم المنتج بالعربية"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الوحدة</label>
              <select
                [(ngModel)]="editForm.unit"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                <option value="kg">كيلو</option>
                <option value="piece">قطعة</option>
                <option value="box">صندوق</option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                [(ngModel)]="editForm.is_active"
                class="rounded border-border"
              />
              <span class="text-sm font-medium">نشط</span>
            </label>
          </div>
          <div class="mt-4 flex gap-2">
            <button
              (click)="updateProduct()"
              class="rounded bg-primary px-4 py-2 text-primary-foreground"
            >
              حفظ التغييرات
            </button>
            <button
              (click)="cancelEdit()"
              class="rounded border border-border bg-background px-4 py-2"
            >
              إلغاء
            </button>
          </div>
        </div>
      }

      <div class="rounded border border-border">
        <table class="w-full">
          <thead class="border-b border-border bg-muted">
            <tr>
              <th class="px-4 py-2 text-right">الاسم</th>
              <th class="px-4 py-2 text-right">الاسم بالعربية</th>
              <th class="px-4 py-2 text-right">الوحدة</th>
              <th class="px-4 py-2 text-right">الحالة</th>
              <th class="px-4 py-2 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            @for (product of products(); track product.id) {
              <tr class="border-b border-border">
                <td class="px-4 py-2">{{ product.name }}</td>
                <td class="px-4 py-2">{{ product.name_ar }}</td>
                <td class="px-4 py-2">{{ product.unit }}</td>
                <td class="px-4 py-2">
                  @if (product.is_active) {
                    <span class="text-green-500">نشط</span>
                  } @else {
                    <span class="text-red-500">غير نشط</span>
                  }
                </td>
                <td class="px-4 py-2">
                  <button
                    (click)="startEdit(product)"
                    class="rounded bg-muted px-3 py-1 text-sm hover:bg-muted/80"
                  >
                    تعديل
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ProductsPage {
  private readonly productsService = inject(ProductsService);

  products = signal<ProductDto[]>([]);
  showForm = signal(false);
  editingProduct = signal<ProductDto | null>(null);
  newProduct: CreateProductDto = { name: '', name_ar: '', unit: 'kg' };
  editForm: UpdateProductDto = { name: '', name_ar: '', unit: 'kg', is_active: true };

  constructor() {
    afterNextRender(() => {
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (products) => this.products.set(products),
    });
  }

  createProduct(): void {
    if (!this.newProduct.name) return;
    this.productsService.createProduct(this.newProduct).subscribe({
      next: (product) => {
        this.products.update((current) => [...current, product]);
        this.newProduct = { name: '', name_ar: '', unit: 'kg' };
        this.showForm.set(false);
      },
    });
  }

  startEdit(product: ProductDto): void {
    this.editingProduct.set(product);
    this.editForm = {
      name: product.name,
      name_ar: product.name_ar || '',
      unit: product.unit,
      is_active: product.is_active,
    };
  }

  updateProduct(): void {
    const product = this.editingProduct();
    if (!product) return;

    const data: UpdateProductDto = {
      name: this.editForm.name || undefined,
      name_ar: this.editForm.name_ar || undefined,
      unit: this.editForm.unit || undefined,
      is_active: this.editForm.is_active,
    };

    this.productsService.updateProduct(product.id, data).subscribe({
      next: (updated) => {
        this.products.update((current) =>
          current.map((p) => (p.id === updated.id ? updated : p))
        );
        this.editingProduct.set(null);
      },
    });
  }

  cancelEdit(): void {
    this.editingProduct.set(null);
  }
}