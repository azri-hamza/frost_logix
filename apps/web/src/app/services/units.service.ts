import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnitDto, CreateUnitDto } from '@frost-logix/shared-types';

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private readonly http = inject(HttpClient);

  getUnits(): Observable<UnitDto[]> {
    return this.http.get<UnitDto[]>('/api/units');
  }

  createUnit(data: CreateUnitDto): Observable<UnitDto> {
    return this.http.post<UnitDto>('/api/units', data);
  }

  deleteUnit(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/units/${id}`);
  }
}