import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WarehouseDto, CreateWarehouseDto } from '@frost-logix/shared-types';

@Injectable({
  providedIn: 'root',
})
export class WarehousesService {
  private readonly http = inject(HttpClient);

  getWarehouses(): Observable<WarehouseDto[]> {
    return this.http.get<WarehouseDto[]>('/api/warehouses');
  }

  getActiveWarehouses(): Observable<WarehouseDto[]> {
    return this.http.get<WarehouseDto[]>('/api/warehouses/active');
  }

  getWarehouse(id: string): Observable<WarehouseDto> {
    return this.http.get<WarehouseDto>(`/api/warehouses/${id}`);
  }

  createWarehouse(data: CreateWarehouseDto): Observable<WarehouseDto> {
    return this.http.post<WarehouseDto>('/api/warehouses', data);
  }

  updateWarehouse(id: string, data: Partial<CreateWarehouseDto>): Observable<WarehouseDto> {
    return this.http.put<WarehouseDto>(`/api/warehouses/${id}`, data);
  }

  deleteWarehouse(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/warehouses/${id}`);
  }
}