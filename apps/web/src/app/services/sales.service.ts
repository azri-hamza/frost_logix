import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateDeliveryNoteDto,
  CreateSalesInvoiceDto,
  StockType,
} from '@frost-logix/shared-types';

export interface DeliveryNoteResponse {
  id: string;
  dn_number: string;
  date: string;
  customer_id: string;
  customer_name: string;
  driver_name: string | null;
  vehicle_plate: string | null;
  notes: string | null;
  created_at: string;
  items: any[];
}

export interface SalesInvoiceResponse {
  id: string;
  invoice_number: string;
  date: string;
  customer_id: string;
  customer_name: string;
  stock_type: StockType;
  delivery_note_ids: string[];
  subtotal: number;
  tax: number;
  net_total: number;
  driver_name: string | null;
  vehicle_plate: string | null;
  notes: string | null;
  created_at: string;
  items: any[];
}

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private readonly http = inject(HttpClient);

  getDeliveryNotes(): Observable<DeliveryNoteResponse[]> {
    return this.http.get<DeliveryNoteResponse[]>('/api/sales/delivery-notes');
  }

  getDeliveryNote(id: string): Observable<DeliveryNoteResponse> {
    return this.http.get<DeliveryNoteResponse>(`/api/sales/delivery-notes/${id}`);
  }

  createDeliveryNote(data: CreateDeliveryNoteDto): Observable<DeliveryNoteResponse> {
    return this.http.post<DeliveryNoteResponse>('/api/sales/delivery-notes', data);
  }

  deleteDeliveryNote(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/sales/delivery-notes/${id}`);
  }

  getInvoices(): Observable<SalesInvoiceResponse[]> {
    return this.http.get<SalesInvoiceResponse[]>('/api/sales/invoices');
  }

  getInvoice(id: string): Observable<SalesInvoiceResponse> {
    return this.http.get<SalesInvoiceResponse>(`/api/sales/invoices/${id}`);
  }

  createInvoice(data: CreateSalesInvoiceDto): Observable<SalesInvoiceResponse> {
    return this.http.post<SalesInvoiceResponse>('/api/sales/invoices', data);
  }

  deleteInvoice(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/sales/invoices/${id}`);
  }
}