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
  templateUrl: './inventory.page.html',
  styleUrl: './inventory.page.css',
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