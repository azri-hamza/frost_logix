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
  templateUrl: './sales.page.html',
  styleUrl: './sales.page.css',
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