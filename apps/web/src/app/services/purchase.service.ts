import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreatePurchaseInvoiceDto,
  CreateGRNDto,
  PurchaseInvoiceItemDto,
  GRNItemDto,
  StockType,
} from '@frost-logix/shared-types';

export interface PurchaseInvoiceResponse {
  id: string;
  invoice_number: string;
  date: string;
  supplier_id: string;
  supplier_name: string;
  stock_type: StockType;
  subtotal: number;
  tax: number;
  net_total: number;
  notes: string | null;
  created_at: string;
  items: any[];
}

export interface GRNResponse {
  id: string;
  grn_number: string;
  date: string;
  supplier_id: string;
  supplier_name: string;
  stock_type: StockType;
  notes: string | null;
  created_at: string;
  items: any[];
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private readonly http = inject(HttpClient);

  getInvoices(): Observable<PurchaseInvoiceResponse[]> {
    return this.http.get<PurchaseInvoiceResponse[]>('/api/purchase/invoices');
  }

  getInvoice(id: string): Observable<PurchaseInvoiceResponse> {
    return this.http.get<PurchaseInvoiceResponse>(`/api/purchase/invoices/${id}`);
  }

  createInvoice(data: CreatePurchaseInvoiceDto): Observable<PurchaseInvoiceResponse> {
    return this.http.post<PurchaseInvoiceResponse>('/api/purchase/invoices', data);
  }

  deleteInvoice(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/purchase/invoices/${id}`);
  }

  getGRNs(): Observable<GRNResponse[]> {
    return this.http.get<GRNResponse[]>('/api/purchase/grn');
  }

  getGRN(id: string): Observable<GRNResponse> {
    return this.http.get<GRNResponse>(`/api/purchase/grn/${id}`);
  }

  createGRN(data: CreateGRNDto): Observable<GRNResponse> {
    return this.http.post<GRNResponse>('/api/purchase/grn', data);
  }

  deleteGRN(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/purchase/grn/${id}`);
  }
}