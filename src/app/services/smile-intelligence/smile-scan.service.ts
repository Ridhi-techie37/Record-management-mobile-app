import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface SmileScanResult {
  smileScore: number;
  alignmentScore: number;
  gumHealthScore: number;
  whitenessScore: number;
  symmetryScore: number;
  plaqueRiskLevel: string;
  confidenceScore: number;
  recommendations: string[];
  imageUrl?: string | null;
  createdAt?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SmileScanService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.smileScans}`;

  constructor(private readonly http: HttpClient) {}

  scanSmile(externalPatientId: number, imageFile: File): Observable<SmileScanResult> {
    if (!externalPatientId || externalPatientId <= 0) {
      return throwError(() => new Error('ExternalPatientId must be greater than 0.'));
    }
    const formData = new FormData();
    formData.append('ExternalPatientId', String(externalPatientId));
    formData.append('Image', imageFile, imageFile.name || 'smile.jpg');

    return this.http.post<Record<string, unknown>>(this.apiUrl, formData).pipe(
      map((body) => this.normalize(body)),
      catchError((err) => throwError(() => err?.error?.message ?? err?.message ?? 'Scan failed'))
    );
  }

  getByPatientId(externalPatientId: number): Observable<SmileScanResult[]> {
    if (!externalPatientId || externalPatientId <= 0) {
      return throwError(() => new Error('ExternalPatientId must be greater than 0.'));
    }
    return this.http.get<Record<string, unknown>[]>(`${this.apiUrl}/${externalPatientId}`).pipe(
      map((items) => (Array.isArray(items) ? items.map((x) => this.normalize(x)) : [])),
      catchError((err) => throwError(() => err?.error?.message ?? err?.message ?? 'Failed to load scans'))
    );
  }

  private normalize(body: Record<string, unknown>): SmileScanResult {
    const get = (camel: string) => {
      const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
      return body[camel] ?? body[pascal];
    };
    return {
      smileScore: Number(get('smileScore')) || 0,
      alignmentScore: Number(get('alignmentScore')) || 0,
      gumHealthScore: Number(get('gumHealthScore')) || 0,
      whitenessScore: Number(get('whitenessScore')) || 0,
      symmetryScore: Number(get('symmetryScore')) || 0,
      plaqueRiskLevel: String(get('plaqueRiskLevel') ?? ''),
      confidenceScore: Number(get('confidenceScore')) || 0,
      recommendations: Array.isArray(get('recommendations')) ? (get('recommendations') as string[]) : [],
      imageUrl: (get('imageUrl') as string) ?? null,
      createdAt: (get('createdAt') as string) ?? null
    };
  }
}
