import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomersService } from '../../services/customers.service';
import { CustomerDto, CreateCustomerDto, UpdateCustomerDto, CustomerType } from '@frost-logix/shared-types';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">الزبائن</h1>
        <button
          (click)="showForm.set(!showForm())"
          class="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          {{ showForm() ? 'إلغاء' : 'إضافة زبون' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">إضافة زبون جديد</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium">الاسم</label>
              <input
                [(ngModel)]="newCustomer.name"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="اسم الزبون"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">النوع</label>
              <select
                [(ngModel)]="newCustomer.type"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                <option value="SCHOOLS">المعاهد</option>
                <option value="OTHERS">آخرون</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">العنوان</label>
              <input
                [(ngModel)]="newCustomer.address"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="العنوان"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الهاتف</label>
              <input
                [(ngModel)]="newCustomer.phone"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الهاتف"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الرقم الضريبي</label>
              <input
                [(ngModel)]="newCustomer.tax_id"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الرقم الضريبي"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الحساب البنكي</label>
              <input
                [(ngModel)]="newCustomer.bank_account"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="الحساب البنكي"
              />
            </div>
          </div>
          <button
            (click)="createCustomer()"
            class="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            حفظ
          </button>
        </div>
      }

      @if (editingCustomer()) {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">تعديل زبون</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium">الاسم</label>
              <input
                [(ngModel)]="editForm.name"
                class="w-full rounded border border-border bg-background px-3 py-2"
                placeholder="اسم الزبون"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">النوع</label>
              <select
                [(ngModel)]="editForm.type"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                <option value="SCHOOLS">المعاهد</option>
                <option value="OTHERS">آخرون</option>
              </select>
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
              (click)="updateCustomer()"
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

      <div class="flex gap-2">
        <button
          (click)="filter.set('all')"
          class="rounded px-3 py-1"
          [class.bg-primary]="filter() === 'all'"
          [class.text-primary-foreground]="filter() === 'all'"
        >
          الكل
        </button>
        <button
          (click)="filter.set('SCHOOLS')"
          class="rounded px-3 py-1"
          [class.bg-primary]="filter() === 'SCHOOLS'"
          [class.text-primary-foreground]="filter() === 'SCHOOLS'"
        >
          المعاهد
        </button>
        <button
          (click)="filter.set('OTHERS')"
          class="rounded px-3 py-1"
          [class.bg-primary]="filter() === 'OTHERS'"
          [class.text-primary-foreground]="filter() === 'OTHERS'"
        >
          آخرون
        </button>
      </div>

      <div class="rounded border border-border">
        <table class="w-full">
          <thead class="border-b border-border bg-muted">
            <tr>
              <th class="px-4 py-2 text-right">الاسم</th>
              <th class="px-4 py-2 text-right">النوع</th>
              <th class="px-4 py-2 text-right">العنوان</th>
              <th class="px-4 py-2 text-right">الهاتف</th>
              <th class="px-4 py-2 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            @for (customer of filteredCustomers(); track customer.id) {
              <tr class="border-b border-border">
                <td class="px-4 py-2">{{ customer.name }}</td>
                <td class="px-4 py-2">
                  {{ customer.type === 'SCHOOLS' ? 'المعاهد' : 'آخرون' }}
                </td>
                <td class="px-4 py-2">{{ customer.address }}</td>
                <td class="px-4 py-2">{{ customer.phone }}</td>
                <td class="px-4 py-2">
                  <button
                    (click)="startEdit(customer)"
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
export class CustomersPage {
  private readonly customersService = inject(CustomersService);

  customers = signal<CustomerDto[]>([]);
  showForm = signal(false);
  editingCustomer = signal<CustomerDto | null>(null);
  filter = signal<'all' | CustomerType>('all');
  newCustomer: CreateCustomerDto = {
    name: '',
    type: 'SCHOOLS',
    address: '',
    phone: '',
    tax_id: '',
    bank_account: '',
  };
  editForm: UpdateCustomerDto = {
    name: '',
    type: 'SCHOOLS',
    address: '',
    phone: '',
    tax_id: '',
    bank_account: '',
  };

  filteredCustomers = () => {
    if (this.filter() === 'all') return this.customers();
    return this.customers().filter((c) => c.type === this.filter());
  };

  constructor() {
    afterNextRender(() => {
      this.loadCustomers();
    });
  }

  loadCustomers(): void {
    this.customersService.getCustomers().subscribe({
      next: (customers) => this.customers.set(customers),
    });
  }

  createCustomer(): void {
    if (!this.newCustomer.name) return;
    this.customersService.createCustomer(this.newCustomer).subscribe({
      next: (customer) => {
        this.customers.update((current) => [...current, customer]);
        this.newCustomer = {
          name: '',
          type: 'SCHOOLS',
          address: '',
          phone: '',
          tax_id: '',
          bank_account: '',
        };
        this.showForm.set(false);
      },
    });
  }

  startEdit(customer: CustomerDto): void {
    this.editingCustomer.set(customer);
    this.editForm = {
      name: customer.name,
      type: customer.type,
      address: customer.address || '',
      phone: customer.phone || '',
      tax_id: customer.tax_id || '',
      bank_account: customer.bank_account || '',
    };
  }

  updateCustomer(): void {
    const customer = this.editingCustomer();
    if (!customer) return;

    const data: UpdateCustomerDto = {
      name: this.editForm.name || undefined,
      type: this.editForm.type,
      address: this.editForm.address || undefined,
      phone: this.editForm.phone || undefined,
      tax_id: this.editForm.tax_id || undefined,
      bank_account: this.editForm.bank_account || undefined,
    };

    this.customersService.updateCustomer(customer.id, data).subscribe({
      next: (updated) => {
        this.customers.update((current) =>
          current.map((c) => (c.id === updated.id ? updated : c))
        );
        this.editingCustomer.set(null);
      },
    });
  }

  cancelEdit(): void {
    this.editingCustomer.set(null);
  }
}