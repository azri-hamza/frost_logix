import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { CustomersService } from '../../services/customers.service';
import { ProductsService } from '../../services/products.service';
import { PdfService } from '../../services/pdf.service';
import { CustomerDto, ProductDto } from '@frost-logix/shared-types';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">المبيعات</h1>
        <div class="flex gap-2">
          <button
            (click)="view.set('delivery-notes')"
            class="rounded px-3 py-1"
            [class.bg-primary]="view() === 'delivery-notes'"
            [class.text-primary-foreground]="view() === 'delivery-notes'"
          >
            أوامر التسليم
          </button>
          <button
            (click)="view.set('invoices')"
            class="rounded px-3 py-1"
            [class.bg-primary]="view() === 'invoices'"
            [class.text-primary-foreground]="view() === 'invoices'"
          >
            فواتير البيع
          </button>
        </div>
      </div>

      @if (view() === 'delivery-notes') {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">أمر تسليم جديد</h2>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium">رقم الأمر</label>
              <input
                [(ngModel)]="dn.dn_number"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">التاريخ</label>
              <input
                [(ngModel)]="dn.date"
                type="date"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">الزبون</label>
              <select
                [(ngModel)]="dn.customer_id"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                @for (customer of customers(); track customer.id) {
                  <option [value]="customer.id">{{ customer.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">اسم السائق</label>
              <input
                [(ngModel)]="dn.driver_name"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">رقم الشاحنة</label>
              <input
                [(ngModel)]="dn.vehicle_plate"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
          </div>

          <div class="mt-4">
            <h3 class="mb-2 font-medium">المواد</h3>
            <div class="mb-2 flex gap-2">
              <select
                [(ngModel)]="newDNItem.product_id"
                class="flex-1 rounded border border-border bg-background px-3 py-2"
              >
                @for (product of products(); track product.id) {
                  <option [value]="product.id">{{ product.name }}</option>
                }
              </select>
              <input
                [(ngModel)]="newDNItem.quantity"
                type="number"
                placeholder="الكمية"
                class="w-24 rounded border border-border bg-background px-3 py-2"
              />
              <input
                [(ngModel)]="newDNItem.unit_price"
                type="number"
                step="0.001"
                placeholder="السعر"
                class="w-24 rounded border border-border bg-background px-3 py-2"
              />
              <button
                (click)="addDNItem()"
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
                @for (item of dn.items; track item.product_id) {
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
            (click)="createDN()"
            class="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            حفظ أمر التسليم
          </button>
        </div>

        <div class="rounded border border-border">
          <table class="w-full">
            <thead class="border-b border-border bg-muted">
              <tr>
                <th class="px-4 py-2 text-right">رقم الأمر</th>
                <th class="px-4 py-2 text-right">التاريخ</th>
                <th class="px-4 py-2 text-right">الزبون</th>
                <th class="px-4 py-2 text-right">السائق</th>
              </tr>
            </thead>
            <tbody>
              @for (d of deliveryNotes(); track d.id) {
                <tr class="border-b border-border">
                  <td class="px-4 py-2">{{ d.dn_number }}</td>
                  <td class="px-4 py-2">{{ d.date | date:'shortDate' }}</td>
                  <td class="px-4 py-2">{{ d.customer_name }}</td>
                  <td class="px-4 py-2">{{ d.driver_name }}</td>
                  <td class="px-4 py-2">
                    <button
                      (click)="exportDnPdf(d)"
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

      @if (view() === 'invoices') {
        <div class="rounded border border-border bg-card p-4">
          <h2 class="mb-4 text-lg font-semibold">فاتورة بيع جديدة</h2>
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
              <label class="mb-1 block text-sm font-medium">الزبون</label>
              <select
                [(ngModel)]="invoice.customer_id"
                class="w-full rounded border border-border bg-background px-3 py-2"
              >
                @for (customer of customers(); track customer.id) {
                  <option [value]="customer.id">{{ customer.name }}</option>
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
            <div>
              <label class="mb-1 block text-sm font-medium">اسم السائق</label>
              <input
                [(ngModel)]="invoice.driver_name"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">رقم الشاحنة</label>
              <input
                [(ngModel)]="invoice.vehicle_plate"
                class="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
          </div>

          <div class="mt-4">
            <h3 class="mb-2 font-medium">المواد</h3>
            <div class="mb-2 flex gap-2">
              <select
                [(ngModel)]="newInvoiceItem.product_id"
                class="flex-1 rounded border border-border bg-background px-3 py-2"
              >
                @for (product of products(); track product.id) {
                  <option [value]="product.id">{{ product.name }}</option>
                }
              </select>
              <input
                [(ngModel)]="newInvoiceItem.quantity"
                type="number"
                placeholder="الكمية"
                class="w-24 rounded border border-border bg-background px-3 py-2"
              />
              <input
                [(ngModel)]="newInvoiceItem.unit_price"
                type="number"
                step="0.001"
                placeholder="السعر"
                class="w-24 rounded border border-border bg-background px-3 py-2"
              />
              <button
                (click)="addInvoiceItem()"
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
                <th class="px-4 py-2 text-right">الزبون</th>
                <th class="px-4 py-2 text-right">الصافي</th>
                <th class="px-4 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              @for (inv of invoices(); track inv.id) {
                <tr class="border-b border-border">
                  <td class="px-4 py-2">{{ inv.invoice_number }}</td>
                  <td class="px-4 py-2">{{ inv.date | date:'shortDate' }}</td>
                  <td class="px-4 py-2">{{ inv.customer_name }}</td>
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
    </div>
  `,
})
export class SalesPage {
  private readonly salesService = inject(SalesService);
  private readonly customersService = inject(CustomersService);
  private readonly productsService = inject(ProductsService);
  private readonly pdfService = inject(PdfService);

  customers = signal<CustomerDto[]>([]);
  products = signal<ProductDto[]>([]);
  deliveryNotes = signal<any[]>([]);
  invoices = signal<any[]>([]);
  view = signal<'delivery-notes' | 'invoices'>('delivery-notes');

  private getProductName(id: string): string {
    const product = this.products().find((p) => p.id === id);
    return product ? product.name : id;
  }

  dn: any = {
    dn_number: '',
    date: new Date().toISOString().split('T')[0],
    customer_id: '',
    driver_name: '',
    vehicle_plate: '',
    items: [],
  };

  invoice: any = {
    invoice_number: '',
    date: new Date().toISOString().split('T')[0],
    customer_id: '',
    stock_type: 'SCHOOLS',
    delivery_note_ids: [],
    subtotal: 0,
    tax: 0,
    net_total: 0,
    driver_name: '',
    vehicle_plate: '',
    items: [],
  };

  newDNItem: any = { product_id: '', quantity: 0, unit_price: 0 };
  newInvoiceItem: any = { product_id: '', quantity: 0, unit_price: 0 };

  calculateSubtotal = () => {
    return this.invoice.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unit_price,
      0,
    );
  };

  calculateNetTotal = () => {
    return this.calculateSubtotal() + this.invoice.tax;
  };

  addDNItem(): void {
    if (!this.newDNItem.product_id || !this.newDNItem.quantity) return;
    this.dn.items = [...this.dn.items, { ...this.newDNItem }];
    this.newDNItem = { product_id: '', quantity: 0, unit_price: 0 };
  }

  addInvoiceItem(): void {
    if (!this.newInvoiceItem.product_id || !this.newInvoiceItem.quantity) return;
    this.invoice.items = [...this.invoice.items, { ...this.newInvoiceItem }];
    this.newInvoiceItem = { product_id: '', quantity: 0, unit_price: 0 };
  }

  createDN(): void {
    if (!this.dn.customer_id || this.dn.items.length === 0) return;
    this.salesService.createDeliveryNote(this.dn).subscribe({
      next: (d) => {
        this.deliveryNotes.update((current) => [d, ...current]);
        this.dn = {
          dn_number: '',
          date: new Date().toISOString().split('T')[0],
          customer_id: '',
          driver_name: '',
          vehicle_plate: '',
          items: [],
        };
      },
    });
  }

  createInvoice(): void {
    if (!this.invoice.customer_id || this.invoice.items.length === 0) return;
    this.invoice.subtotal = this.calculateSubtotal();
    this.invoice.net_total = this.calculateNetTotal();
    this.salesService.createInvoice(this.invoice).subscribe({
      next: (inv) => {
        this.invoices.update((current) => [...current, inv]);
        this.invoice = {
          invoice_number: '',
          date: new Date().toISOString().split('T')[0],
          customer_id: '',
          stock_type: 'SCHOOLS',
          delivery_note_ids: [],
          subtotal: 0,
          tax: 0,
          net_total: 0,
          driver_name: '',
          vehicle_plate: '',
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
    this.customersService.getCustomers().subscribe({
      next: (customers) => this.customers.set(customers),
    });
    this.productsService.getProducts().subscribe({
      next: (products) => this.products.set(products),
    });
    this.salesService.getDeliveryNotes().subscribe({
      next: (dns) => this.deliveryNotes.set(dns),
    });
    this.salesService.getInvoices().subscribe({
      next: (invoices) => this.invoices.set(invoices),
    });
  }

  async exportDnPdf(dn: any): Promise<void> {
    const blob = await this.pdfService.generateDeliveryNote({
      dnNumber: dn.dn_number,
      date: new Date(dn.date).toLocaleDateString('ar-TN'),
      customerName: dn.customer_name,
      stockType: dn.stock_type,
      items: dn.items.map((item: any) => ({
        productName: item.product_name || this.getProductName(item.product_id),
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
      })),
      driverName: dn.driver_name,
      vehiclePlate: dn.vehicle_plate,
    });
    this.pdfService.downloadPdf(blob, `delivery-${dn.dn_number}.pdf`);
  }

  async exportInvoicePdf(inv: any): Promise<void> {
    const blob = await this.pdfService.generateSalesInvoice({
      invoiceNumber: inv.invoice_number,
      date: new Date(inv.date).toLocaleDateString('ar-TN'),
      customerName: inv.customer_name,
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
      driverName: inv.driver_name,
      vehiclePlate: inv.vehicle_plate,
    });
    this.pdfService.downloadPdf(blob, `sales-${inv.invoice_number}.pdf`);
  }
}