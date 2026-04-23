import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductDto, CreateProductDto, UpdateProductDto } from '@frost-logix/shared-types';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>('/api/products');
  }

  getActiveProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>('/api/products/active');
  }

  getProduct(id: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`/api/products/${id}`);
  }

  createProduct(data: CreateProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>('/api/products', data);
  }

  updateProduct(id: string, data: UpdateProductDto): Observable<ProductDto> {
    return this.http.put<ProductDto>(`/api/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/products/${id}`);
  }
}