import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerDto, CreateCustomerDto, UpdateCustomerDto, CustomerType } from '@frost-logix/shared-types';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly http = inject(HttpClient);

  getCustomers(): Observable<CustomerDto[]> {
    return this.http.get<CustomerDto[]>('/api/customers');
  }

  getCustomersByType(type: CustomerType): Observable<CustomerDto[]> {
    return this.http.get<CustomerDto[]>(`/api/customers/type/${type}`);
  }

  getCustomer(id: string): Observable<CustomerDto> {
    return this.http.get<CustomerDto>(`/api/customers/${id}`);
  }

  createCustomer(data: CreateCustomerDto): Observable<CustomerDto> {
    return this.http.post<CustomerDto>('/api/customers', data);
  }

  updateCustomer(id: string, data: UpdateCustomerDto): Observable<CustomerDto> {
    return this.http.put<CustomerDto>(`/api/customers/${id}`, data);
  }

  deleteCustomer(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/customers/${id}`);
  }
}