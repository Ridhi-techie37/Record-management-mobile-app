import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export type ReportType = 'income' | 'treatment' | 'patient';

export interface ReportItem {
  treatment: string;
  count: number;
  patients: number;
  totalIncome: number;
}

interface GetReportResponse {
  items?: unknown[];
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapReportItem(raw: any): ReportItem {
  return {
    treatment: raw?.treatment ?? raw?.Treatment ?? '',
    count: toNumber(raw?.count ?? raw?.Count),
    patients: toNumber(raw?.patients ?? raw?.Patients),
    totalIncome: toNumber(raw?.totalIncome ?? raw?.TotalIncome)
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  getReport(startDate: string, endDate: string): Observable<ReportItem[]> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.report}`;
    return this.http.post<GetReportResponse | unknown[]>(url, { startDate, endDate }).pipe(
      map((response) => {
        const rawItems = Array.isArray(response) ? response : (response as GetReportResponse)?.items ?? [];
        return (rawItems ?? []).map(mapReportItem);
      })
    );
  }
}
