import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliersService } from '../../services/suppliers.service';
import { SupplierDto, CreateSupplierDto, UpdateSupplierDto } from '@frost-logix/shared-types';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">الموردون</h1>
        <button
          (click)="showForm.set(!showForm())"
          class="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          {{ showForm() ? 'إلغاء' : 'إضافة مورد' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">إضافة مورد جديد</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium">الاسم</label>
              <input
                [(ngModel)]="newSupplier.name"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="اسم المورد"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">العنوان</label>
              <input
                [(ngModel)]="newSupplier.address"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="العنوان"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الهاتف</label>
              <input
                [(ngModel)]="newSupplier.phone"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الهاتف"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الفاكس</label>
              <input
                [(ngModel)]="newSupplier.fax"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الفاكس"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الرقم الضريبي</label>
              <input
                [(ngModel)]="newSupplier.tax_id"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الرقم الضريبي"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الحساب البنكي</label>
              <input
                [(ngModel)]="newSupplier.bank_account"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الحساب البنكي"
              />
            </div>
          </div>
          <button
            (click)="createSupplier()"
            class="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            حفظ
          </button>
        </div>
      }

      @if (editingSupplier()) {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">تعديل مورد</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium">الاسم</label>
              <input
                [(ngModel)]="editForm.name"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="اسم المورد"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">العنوان</label>
              <input
                [(ngModel)]="editForm.address"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="العنوان"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الهاتف</label>
              <input
                [(ngModel)]="editForm.phone"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الهاتف"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الفاكس</label>
              <input
                [(ngModel)]="editForm.fax"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الفاكس"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الرقم الضريبي</label>
              <input
                [(ngModel)]="editForm.tax_id"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الرقم الضريبي"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الحساب البنكي</label>
              <input
                [(ngModel)]="editForm.bank_account"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الحساب البنكي"
              />
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <button
              (click)="updateSupplier()"
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
              <th class="px-4 py-2 text-right">العنوان</th>
              <th class="px-4 py-2 text-right">الهاتف</th>
              <th class="px-4 py-2 text-right">الفاكس</th>
              <th class="px-4 py-2 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            @for (supplier of suppliers(); track supplier.id) {
              <tr class="border-b border-border">
                <td class="px-4 py-2">{{ supplier.name }}</td>
                <td class="px-4 py-2">{{ supplier.address }}</td>
                <td class="px-4 py-2">{{ supplier.phone }}</td>
                <td class="px-4 py-2">{{ supplier.fax }}</td>
                <td class="px-4 py-2">
                  <button
                    (click)="startEdit(supplier)"
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
export class SuppliersPage {
  private readonly suppliersService = inject(SuppliersService);

  suppliers = signal<SupplierDto[]>([]);
  showForm = signal(false);
  editingSupplier = signal<SupplierDto | null>(null);
  newSupplier: CreateSupplierDto = {
    name: '',
    address: '',
    phone: '',
    fax: '',
    tax_id: '',
    bank_account: '',
  };
  editForm: UpdateSupplierDto = {
    name: '',
    address: '',
    phone: '',
    fax: '',
    tax_id: '',
    bank_account: '',
  };

  constructor() {
    afterNextRender(() => {
      this.loadSuppliers();
    });
  }

  loadSuppliers(): void {
    this.suppliersService.getSuppliers().subscribe({
      next: (suppliers) => this.suppliers.set(suppliers),
    });
  }

  createSupplier(): void {
    if (!this.newSupplier.name) return;
    this.suppliersService.createSupplier(this.newSupplier).subscribe({
      next: (supplier) => {
        this.suppliers.update((current) => [...current, supplier]);
        this.newSupplier = {
          name: '',
          address: '',
          phone: '',
          fax: '',
          tax_id: '',
          bank_account: '',
        };
        this.showForm.set(false);
      },
    });
  }

  startEdit(supplier: SupplierDto): void {
    this.editingSupplier.set(supplier);
    this.editForm = {
      name: supplier.name,
      address: supplier.address || '',
      phone: supplier.phone || '',
      fax: supplier.fax || '',
      tax_id: supplier.tax_id || '',
      bank_account: supplier.bank_account || '',
    };
  }

  updateSupplier(): void {
    const supplier = this.editingSupplier();
    if (!supplier) return;

    const data: UpdateSupplierDto = {
      name: this.editForm.name || undefined,
      address: this.editForm.address || undefined,
      phone: this.editForm.phone || undefined,
      fax: this.editForm.fax || undefined,
      tax_id: this.editForm.tax_id || undefined,
      bank_account: this.editForm.bank_account || undefined,
    };

    this.suppliersService.updateSupplier(supplier.id, data).subscribe({
      next: (updated) => {
        this.suppliers.update((current) =>
          current.map((s) => (s.id === updated.id ? updated : s))
        );
        this.editingSupplier.set(null);
      },
    });
  }

  cancelEdit(): void {
    this.editingSupplier.set(null);
  }
}