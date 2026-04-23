import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockComparisonRow, StockType } from '@frost-logix/shared-types';

export interface DashboardSummary {
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalSalesToday: number;
  todaySalesTotal: number;
  todayPurchasesTotal: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);

  getStockComparison(stockType: StockType): Observable<StockComparisonRow[]> {
    return this.http.get<StockComparisonRow[]>(`/api/reports/stock-comparison?stockType=${stockType}`);
  }

  getPurchaseAnalysis(
    startDate?: string,
    endDate?: string,
    stockType?: StockType,
  ): Observable<any[]> {
    let url = '/api/reports/purchase-analysis';
    const params: string[] = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (stockType) params.push(`stockType=${stockType}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<any[]>(url);
  }

  getSalesAnalysis(
    startDate?: string,
    endDate?: string,
    stockType?: StockType,
  ): Observable<any[]> {
    let url = '/api/reports/sales-analysis';
    const params: string[] = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (stockType) params.push(`stockType=${stockType}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<any[]>(url);
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>('/api/reports/dashboard');
  }
}