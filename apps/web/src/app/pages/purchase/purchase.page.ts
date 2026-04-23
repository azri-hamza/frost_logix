import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseService } from '../../services/purchase.service';
import { SuppliersService } from '../../services/suppliers.service';
import { ProductsService } from '../../services/products.service';
import { PdfService } from '../../services/pdf.service';
import { SupplierDto, ProductDto } from '@frost-logix/shared-types';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">المشتريات</h1>
        <div class="flex gap-2">
          <button
            (click)="view.set('invoices')"
            class="rounded px-3 py-1"
            [class.bg-primary]="view() === 'invoices'"
            [class.text-primary-foreground]="view() === 'invoices'"
          >
            فواتير الشراء
          </button>
          <button
            (click)="view.set('grn')"
            class="rounded px-3 py-1"
            [class.bg-primary]="view() === 'grn'"
            [class.text-primary-foreground]="view() === 'grn'"
          >
            أوامر التسلم
          </button>
        </div>
      </div>

      @if (view() === 'invoices') {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">فاتورة شراء جديدة</h2>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium">رقم الفاتورة</label>
              <input
                [(ngModel)]="invoice.invoice_number"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">التاريخ</label>
              <input
                [(ngModel)]="invoice.date"
                type="date"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">المورد</label>
              <select
                [(ngModel)]="invoice.supplier_id"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                @for (supplier of suppliers(); track supplier.id) {
                  <option [value]="supplier.id">{{ supplier.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">نوع المخزون</label>
              <select
                [(ngModel)]="invoice.stock_type"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                <option value="SCHOOLS">المعاهد</option>
                <option value="OTHERS">آخرون</option>
              </select>
            </div>
          </div>

          <div class="mt-4">
            <h3 class="mb-2 font-medium">المواد</h3>
            <div class="mb-2 flex gap-2">
              <select
                [(ngModel)]="newItem.product_id"
                class="flex-1 rounded border border-border bg-background px-3 py-2"
              >
                @for (product of products(); track product.id) {
                  <option [value]="product.id">{{ product.name }}</option>
                }
              </select>
              <input
                [(ngModel)]="newItem.quantity"
                type="number"
                placeholder="الكمية"
                class="w-24 rounded border border-border bg-background px-3 py-2"
              />
              <input
                [(ngModel)]="newItem.unit_price"
                type="number"
                step="0.001"
                placeholder="السعر"
                class="w-24 rounded border border-border bg-background px-3 py-2"
              />
              <button
                (click)="addItem()"
                class="rounded bg-secondary px-3 py-2"
              >
                إضافة
              </button>
            </div>
            <table class="w-full">
              <thead class="border-b border-border bg-muted">
                <tr>
                  <th class="px-2 py-1 text-right">المنتج</th>
                  <th class="px-2 py-1 text-right">الكمية</th>
                  <th class="px-2 py-1 text-right">السعر</th>
                  <th class="px-2 py-1 text-right">المجموع</th>
                </tr>
              </thead>
              <tbody>
                @for (item of invoice.items; track item.product_id) {
                  <tr class="border-b border-border">
                    <td class="px-2 py-1">{{ item.product_id }}</td>
                    <td class="px-2 py-1">{{ item.quantity }}</td>
                    <td class="px-2 py-1">{{ item.unit_price }}</td>
                    <td class="px-2 py-1">{{ item.quantity * item.unit_price }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex justify-end gap-4">
            <div>المجموع: {{ calculateSubtotal() }}</div>
            <div>الضريبة: {{ invoice.tax }}</div>
            <div>الصافي: {{ calculateNetTotal() }}</div>
          </div>

          <button
            (click)="createInvoice()"
            class="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            حفظ الفاتورة
          </button>
        </div>

        <div class="rounded border border-border">
          <table class="w-full">
            <thead class="border-b border-border bg-muted">
              <tr>
                <th class="px-4 py-2 text-right">رقم الفاتورة</th>
                <th class="px-4 py-2 text-right">التاريخ</th>
                <th class="px-4 py-2 text-right">المورد</th>
                <th class="px-4 py-2 text-right">الصافي</th>
                <th class="px-4 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              @for (inv of invoices(); track inv.id) {
                <tr class="border-b border-border">
                  <td class="px-4 py-2">{{ inv.invoice_number }}</td>
                  <td class="px-4 py-2">{{ inv.date | date:'shortDate' }}</td>
                  <td class="px-4 py-2">{{ inv.supplier_name }}</td>
                  <td class="px-4 py-2">{{ inv.net_total }}</td>
                  <td class="px-4 py-2">
                    <button
                      (click)="exportInvoicePdf(inv)"
                      class="text-xs text-primary hover:underline"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (view() === 'grn') {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">أمر استلام جديد</h2>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium">رقم الأم��</label>
              <input
                [(ngModel)]="grn.grn_number"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">التاريخ</label>
              <input
                [(ngModel)]="grn.date"
                type="date"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">المورد</label>
              <select
                [(ngModel)]="grn.supplier_id"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                @for (supplier of suppliers(); track supplier.id) {
                  <option [value]="supplier.id">{{ supplier.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">نوع المخزون</label>
              <select
                [(ngModel)]="grn.stock_type"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                <option value="SCHOOLS">المعاهد</option>
                <option value="OTHERS">آخرون</option>
              </select>
            </div>
          </div>

          <div class="mt-4">
            <h3 class="mb-2 font-medium">المواد</h3>
            <div class="mb-2 flex gap-2">
              <select
                [(ngModel)]="newGRNItem.product_id"
                class="flex-1 rounded border border-border bg-background px-3 py-2"
              >
                @for (product of products(); track product.id) {
                  <option [value]="product.id">{{ product.name }}</option>
                }
              </select>
              <input
                [(ngModel)]="newGRNItem.quantity"
                type="number"
                placeholder="الكمية"
                class="w-24 rounded border border-border bg-background px-3 py-2"
              />
              <input
                [(ngModel)]="newGRNItem.unit_price"
                type="number"
                step="0.001"
                placeholder="السعر"
                class="w-24 rounded border border-border bg-background px-3 py-2"
              />
              <button
                (click)="addGRNItem()"
                class="rounded bg-secondary px-3 py-2"
              >
                إضافة
              </button>
            </div>
            <table class="w-full">
              <thead class="border-b border-border bg-muted">
                <tr>
                  <th class="px-2 py-1 text-right">المنتج</th>
                  <th class="px-2 py-1 text-right">الكمية</th>
                  <th class="px-2 py-1 text-right">السعر</th>
                  <th class="px-2 py-1 text-right">المجموع</th>
                </tr>
              </thead>
              <tbody>
                @for (item of grn.items; track item.product_id) {
                  <tr class="border-b border-border">
                    <td class="px-2 py-1">{{ item.product_id }}</td>
                    <td class="px-2 py-1">{{ item.quantity }}</td>
                    <td class="px-2 py-1">{{ item.unit_price }}</td>
                    <td class="px-2 py-1">{{ item.quantity * item.unit_price }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <button
            (click)="createGRN()"
            class="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            حفظ أمر الاستلام
          </button>
        </div>

        <div class="rounded border border-border">
          <table class="w-full">
            <thead class="border-b border-border bg-muted">
              <tr>
                <th class="px-4 py-2 text-right">رقم الأمر</th>
                <th class="px-4 py-2 text-right">التاريخ</th>
                <th class="px-4 py-2 text-right">المورد</th>
                <th class="px-4 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              @for (g of grns(); track g.id) {
                <tr class="border-b border-border">
                  <td class="px-4 py-2">{{ g.grn_number }}</td>
                  <td class="px-4 py-2">{{ g.date | date:'shortDate' }}</td>
                  <td class="px-4 py-2">{{ g.supplier_name }}</td>
                  <td class="px-4 py-2">
                    <button
                      (click)="exportGrnPdf(g)"
                      class="text-xs text-primary hover:underline"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class PurchasePage {
  private readonly purchaseService = inject(PurchaseService);
  private readonly suppliersService = inject(SuppliersService);
  private readonly productsService = inject(ProductsService);
  private readonly pdfService = inject(PdfService);

  suppliers = signal<SupplierDto[]>([]);
  products = signal<ProductDto[]>([]);
  invoices = signal<any[]>([]);
  grns = signal<any[]>([]);
  view = signal<'invoices' | 'grn'>('invoices');

  private getProductName(id: string): string {
    const product = this.products().find((p) => p.id === id);
    return product ? product.name : id;
  }

  invoice: any = {
    invoice_number: '',
    date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    stock_type: 'SCHOOLS',
    subtotal: 0,
    tax: 0,
    net_total: 0,
    items: [],
  };

  grn: any = {
    grn_number: '',
    date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    stock_type: 'SCHOOLS',
    items: [],
  };

  newItem: any = { product_id: '', quantity: 0, unit_price: 0 };
  newGRNItem: any = { product_id: '', quantity: 0, unit_price: 0 };

  calculateSubtotal = () => {
    return this.invoice.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unit_price,
      0,
    );
  };

  calculateNetTotal = () => {
    return this.calculateSubtotal() + this.invoice.tax;
  };

  addItem(): void {
    if (!this.newItem.product_id || !this.newItem.quantity) return;
    this.invoice.items = [...this.invoice.items, { ...this.newItem }];
    this.newItem = { product_id: '', quantity: 0, unit_price: 0 };
  }

  addGRNItem(): void {
    if (!this.newGRNItem.product_id || !this.newGRNItem.quantity) return;
    this.grn.items = [...this.grn.items, { ...this.newGRNItem }];
    this.newGRNItem = { product_id: '', quantity: 0, unit_price: 0 };
  }

  createInvoice(): void {
    if (!this.invoice.supplier_id || this.invoice.items.length === 0) return;
    this.invoice.subtotal = this.calculateSubtotal();
    this.invoice.net_total = this.calculateNetTotal();
    this.purchaseService.createInvoice(this.invoice).subscribe({
      next: (inv) => {
        this.invoices.update((current) => [inv, ...current]);
        this.invoice = {
          invoice_number: '',
          date: new Date().toISOString().split('T')[0],
          supplier_id: '',
          stock_type: 'SCHOOLS',
          subtotal: 0,
          tax: 0,
          net_total: 0,
          items: [],
        };
      },
    });
  }

  createGRN(): void {
    if (!this.grn.supplier_id || this.grn.items.length === 0) return;
    this.purchaseService.createGRN(this.grn).subscribe({
      next: (g) => {
        this.grns.update((current) => [g, ...current]);
        this.grn = {
          grn_number: '',
          date: new Date().toISOString().split('T')[0],
          supplier_id: '',
          stock_type: 'SCHOOLS',
          items: [],
        };
      },
    });
  }

  constructor() {
    afterNextRender(() => {
      this.loadData();
    });
  }

  loadData(): void {
    this.suppliersService.getSuppliers().subscribe({
      next: (suppliers) => this.suppliers.set(suppliers),
    });
    this.productsService.getProducts().subscribe({
      next: (products) => this.products.set(products),
    });
    this.purchaseService.getInvoices().subscribe({
      next: (invoices) => this.invoices.set(invoices),
    });
    this.purchaseService.getGRNs().subscribe({
      next: (grns) => this.grns.set(grns),
    });
  }

  async exportInvoicePdf(inv: any): Promise<void> {
    const blob = await this.pdfService.generatePurchaseInvoice({
      invoiceNumber: inv.invoice_number,
      date: new Date(inv.date).toLocaleDateString('ar-TN'),
      supplierName: inv.supplier_name,
      stockType: inv.stock_type,
      items: inv.items.map((item: any) => ({
        productName: item.product_name || this.getProductName(item.product_id),
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
      })),
      subtotal: inv.subtotal,
      tax: inv.tax,
      netTotal: inv.net_total,
    });
    this.pdfService.downloadPdf(blob, `purchase-${inv.invoice_number}.pdf`);
  }

  async exportGrnPdf(grn: any): Promise<void> {
    const total = grn.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unit_price,
      0,
    );
    const blob = await this.pdfService.generateGRN({
      grnNumber: grn.grn_number,
      date: new Date(grn.date).toLocaleDateString('ar-TN'),
      supplierName: grn.supplier_name,
      stockType: grn.stock_type,
      items: grn.items.map((item: any) => ({
        productName: item.product_name || this.getProductName(item.product_id),
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
      })),
      total: total,
    });
    this.pdfService.downloadPdf(blob, `grn-${grn.grn_number}.pdf`);
  }
}