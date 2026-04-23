import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BatchDto, CreateBatchDto, StockType } from '@frost-logix/shared-types';

export interface StockSummary {
  product_id: string;
  product_name: string;
  product_unit: string;
  total_quantity: number;
  stock_type: StockType;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);

  getBatches(warehouseId?: string): Observable<BatchDto[]> {
    const url = warehouseId
      ? `/api/batches?warehouseId=${warehouseId}`
      : '/api/batches';
    return this.http.get<BatchDto[]>(url);
  }

  getBatch(id: string): Observable<BatchDto> {
    return this.http.get<BatchDto>(`/api/batches/${id}`);
  }

  createBatch(data: CreateBatchDto): Observable<BatchDto> {
    return this.http.post<BatchDto>('/api/batches', data);
  }

  deleteBatch(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/batches/${id}`);
  }

  getStockSummary(warehouseId?: string, stockType?: StockType): Observable<StockSummary[]> {
    let url = '/api/batches/stock-summary';
    const params: string[] = [];
    if (warehouseId) params.push(`warehouseId=${warehouseId}`);
    if (stockType) params.push(`stockType=${stockType}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<StockSummary[]>(url);
  }
}