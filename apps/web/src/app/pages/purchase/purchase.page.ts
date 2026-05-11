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
  templateUrl: './purchase.page.html',
  styleUrl: './purchase.page.css',
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

  getProductName(id: string): string {
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

  newItem: any = { product_id: '', product_name: '', quantity: 0, unit_price: 0 };
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
    const product = this.products().find((p) => p.id === this.newItem.product_id);
    this.invoice.items = [
      ...this.invoice.items,
      { ...this.newItem, product_name: product?.name || '' },
    ];
    this.newItem = { product_id: '', quantity: 0, unit_price: 0 };
  }

  addGRNItem(): void {
    if (!this.newGRNItem.product_id || !this.newGRNItem.quantity) return;
    const product = this.products().find((p) => p.id === this.newGRNItem.product_id);
    this.grn.items = [
      ...this.grn.items,
      { ...this.newGRNItem, product_name: product?.name || '' },
    ];
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