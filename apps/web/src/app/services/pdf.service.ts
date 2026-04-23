import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private readonly http = inject(HttpClient);

  generatePurchaseInvoice(data: {
    invoiceNumber: string;
    date: string;
    supplierName: string;
    stockType: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    netTotal: number;
    companyInfo?: {
      name: string;
      address: string;
      phone: string;
      taxId: string;
      bankAccount: string;
    };
  }): Promise<Blob> {
    return this.http
      .post('/api/pdf/purchase-invoice', data, {
        responseType: 'blob',
      })
      .toPromise() as Promise<Blob>;
  }

  generateGRN(data: {
    grnNumber: string;
    date: string;
    supplierName: string;
    stockType: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    total: number;
    companyInfo?: {
      name: string;
      address: string;
      phone: string;
      taxId: string;
      bankAccount: string;
    };
  }): Promise<Blob> {
    return this.http
      .post('/api/pdf/grn', data, {
        responseType: 'blob',
      })
      .toPromise() as Promise<Blob>;
  }

  generateDeliveryNote(data: {
    dnNumber: string;
    date: string;
    customerName: string;
    stockType: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    driverName?: string;
    vehiclePlate?: string;
    companyInfo?: {
      name: string;
      address: string;
      phone: string;
      taxId: string;
      bankAccount: string;
    };
  }): Promise<Blob> {
    return this.http
      .post('/api/pdf/delivery-note', data, {
        responseType: 'blob',
      })
      .toPromise() as Promise<Blob>;
  }

  generateSalesInvoice(data: {
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerTaxId?: string;
    customerAddress?: string;
    stockType: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    netTotal: number;
    driverName?: string;
    vehiclePlate?: string;
    companyInfo?: {
      name: string;
      address: string;
      phone: string;
      taxId: string;
      bankAccount: string;
    };
  }): Promise<Blob> {
    return this.http
      .post('/api/pdf/sales-invoice', data, {
        responseType: 'blob',
      })
      .toPromise() as Promise<Blob>;
  }

  generateStockComparisonReport(data: {
    stockType: string;
    items: Array<{
      productName: string;
      productUnit: string;
      purchaseQuantity: number;
      purchaseValue: number;
      saleQuantity: number;
      saleValue: number;
      stockQuantity: number;
    }>;
  }): Promise<Blob> {
    return this.http
      .post('/api/pdf/stock-comparison', data, {
        responseType: 'blob',
      })
      .toPromise() as Promise<Blob>;
  }

  downloadPdf(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}