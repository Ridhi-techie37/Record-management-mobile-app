import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Employee {
  empId: number;
  empName: string;
  phoneNumber: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}${API_CONFIG.endpoints.employees}`);
  }
}
