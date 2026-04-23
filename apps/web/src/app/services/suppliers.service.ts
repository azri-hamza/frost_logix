import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupplierDto, CreateSupplierDto, UpdateSupplierDto } from '@frost-logix/shared-types';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private readonly http = inject(HttpClient);

  getSuppliers(): Observable<SupplierDto[]> {
    return this.http.get<SupplierDto[]>('/api/suppliers');
  }

  getSupplier(id: string): Observable<SupplierDto> {
    return this.http.get<SupplierDto>(`/api/suppliers/${id}`);
  }

  createSupplier(data: CreateSupplierDto): Observable<SupplierDto> {
    return this.http.post<SupplierDto>('/api/suppliers', data);
  }

  updateSupplier(id: string, data: UpdateSupplierDto): Observable<SupplierDto> {
    return this.http.put<SupplierDto>(`/api/suppliers/${id}`, data);
  }

  deleteSupplier(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/suppliers/${id}`);
  }
}