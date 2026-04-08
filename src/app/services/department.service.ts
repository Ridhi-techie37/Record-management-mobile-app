import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Department {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<any[]>(`${this.baseUrl}${API_CONFIG.endpoints.departments}`).pipe(
      map((list) => list.map((d) => ({ id: d.id ?? d.ID ?? 0, name: d.name ?? d.Name ?? '' })))
    );
  }
}
