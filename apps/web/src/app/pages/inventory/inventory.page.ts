import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { ProductsService } from '../../services/products.service';
import { WarehousesService } from '../../services/warehouses.service';
import { ProductDto, WarehouseDto, StockType } from '@frost-logix/shared-types';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">المخزون</h1>
        <button
          (click)="showForm.set(!showForm())"
          class="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          {{ showForm() ? 'إلغاء' : 'إضافة دفعة' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">إضافة دفعة جديدة</h2>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium">المنتج</label>
              <select
                [(ngModel)]="newBatch.product_id"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                @for (product of products(); track product.id) {
                  <option [value]="product.id">{{ product.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">المستودع</label>
              <select
                [(ngModel)]="newBatch.warehouse_id"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                @for (warehouse of warehouses(); track warehouse.id) {
                  <option [value]="warehouse.id">{{ warehouse.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">نوع المخزون</label>
              <select
                [(ngModel)]="newBatch.stock_type"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                <option value="SCHOOLS">المعاهد</option>
                <option value="OTHERS">آخرون</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الكمية</label>
              <input
                [(ngModel)]="newBatch.quantity"
                type="number"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">سعر الوحدة</label>
              <input
                [(ngModel)]="newBatch.unit_price"
                type="number"
                step="0.001"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">تاريخ الانتهاء</label>
              <input
                [(ngModel)]="newBatch.expiry_date"
                type="date"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
          </div>
          <button
            (click)="createBatch()"
            class="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            حفظ
          </button>
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
              <th class="px-4 py-2 text-right">المنتج</th>
              <th class="px-4 py-2 text-right">المستودع</th>
              <th class="px-4 py-2 text-right">الكمية</th>
              <th class="px-4 py-2 text-right">سعر الوحدة</th>
              <th class="px-4 py-2 text-right">تاريخ الانتهاء</th>
              <th class="px-4 py-2 text-right">النوع</th>
            </tr>
          </thead>
          <tbody>
            @for (batch of filteredBatches(); track batch.id) {
              <tr class="border-b border-border">
                <td class="px-4 py-2">{{ batch.product_id }}</td>
                <td class="px-4 py-2">{{ batch.warehouse_id }}</td>
                <td class="px-4 py-2">{{ batch.quantity }}</td>
                <td class="px-4 py-2">{{ batch.unit_price }}</td>
                <td class="px-4 py-2">{{ batch.expiry_date }}</td>
                <td class="px-4 py-2">
                  {{ batch.stock_type === 'SCHOOLS' ? 'المعاهد' : 'آخرون' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div>
        <h2 class="mb-2 text-lg font-semibold">ملخص المخزون</h2>
        <div class="rounded border border-border">
          <table class="w-full">
            <thead class="border-b border-border bg-muted">
              <tr>
                <th class="px-4 py-2 text-right">المنتج</th>
                <th class="px-4 py-2 text-right">الكمية</th>
                <th class="px-4 py-2 text-right">النوع</th>
              </tr>
            </thead>
            <tbody>
              @for (summary of stockSummary(); track summary.product_id) {
                <tr class="border-b border-border">
                  <td class="px-4 py-2">{{ summary.product_name }}</td>
                  <td class="px-4 py-2">
                    {{ summary.total_quantity }} {{ summary.product_unit }}
                  </td>
                  <td class="px-4 py-2">
                    {{ summary.stock_type === 'SCHOOLS' ? 'المعاهد' : 'آخرون' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class InventoryPage {
  private readonly inventoryService = inject(InventoryService);
  private readonly productsService = inject(ProductsService);
  private readonly warehousesService = inject(WarehousesService);

  products = signal<ProductDto[]>([]);
  warehouses = signal<WarehouseDto[]>([]);
  batches = signal<any[]>([]);
  stockSummary = signal<any[]>([]);
  showForm = signal(false);
  filter = signal<'all' | StockType>('all');

  newBatch: any = {
    product_id: '',
    warehouse_id: '',
    quantity: 0,
    unit_price: 0,
    stock_type: 'SCHOOLS',
    expiry_date: '',
  };

  filteredBatches = () => {
    if (this.filter() === 'all') return this.batches();
    return this.batches().filter((b) => b.stock_type === this.filter());
  };

  constructor() {
    afterNextRender(() => {
      this.loadData();
    });
  }

  loadData(): void {
    this.productsService.getProducts().subscribe({
      next: (products) => this.products.set(products),
    });
    this.warehousesService.getWarehouses().subscribe({
      next: (warehouses) => this.warehouses.set(warehouses),
    });
    this.inventoryService.getBatches().subscribe({
      next: (batches) => this.batches.set(batches),
    });
    this.inventoryService.getStockSummary().subscribe({
      next: (summary) => this.stockSummary.set(summary),
    });
  }

  createBatch(): void {
    if (!this.newBatch.product_id || !this.newBatch.warehouse_id) return;
    this.inventoryService.createBatch(this.newBatch).subscribe({
      next: (batch) => {
        this.batches.update((current) => [...current, batch]);
        this.newBatch = {
          product_id: '',
          warehouse_id: '',
          quantity: 0,
          unit_price: 0,
          stock_type: 'SCHOOLS',
          expiry_date: '',
        };
        this.showForm.set(false);
      },
    });
  }
}