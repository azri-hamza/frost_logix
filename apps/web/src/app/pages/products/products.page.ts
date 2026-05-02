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
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">المنتجات</h1>
        <button hlmBtn (click)="toggleForm()">
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
                (ngModelChange)="onNewProductNameChange($event)"
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
          <button hlmBtn (click)="createProduct()">
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
                (ngModelChange)="onEditFormNameChange($event)"
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
            <button hlmBtn (click)="updateProduct()">
              حفظ التغييرات
            </button>
            <button hlmBtn variant="outline" (click)="cancelEdit()">
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
                    hlmBtn
                    variant="outline"
                    size="sm"
                  >
                    تعديل
                  </button>

                   <hlm-alert-dialog>
                     <button
                       hlmAlertDialogTrigger
                       hlmBtn
                       variant="destructive"
                       size="sm"
                       class="ml-2"
                     >
                       حذف
                     </button>
                     <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx" (keydown.escape)="ctx.close()">
                       <hlm-alert-dialog-header>
                         <h2 hlmAlertDialogTitle>حذف المنتج</h2>
                         <p hlmAlertDialogDescription>
                           هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
                         </p>
                       </hlm-alert-dialog-header>
                       <hlm-alert-dialog-footer>
                         <button
                           hlmAlertDialogCancel
                           hlmBtn
                           variant="outline"
                           (click)="ctx.close()"
                         >
                           إلغاء
                         </button>
                         <button
                           hlmAlertDialogAction
                           hlmBtn
                           variant="destructive"
                           (click)="confirmDelete(product.id); ctx.close()"
                         >
                           حذف
                         </button>
                       </hlm-alert-dialog-footer>
                     </hlm-alert-dialog-content>
                   </hlm-alert-dialog>
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
        this.products.update((current) =>
          current.map((p) => (p.id === updated.id ? updated : p))
        );
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
        this.products.update((current) =>
          current.filter((p) => p.id !== productId)
        );
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