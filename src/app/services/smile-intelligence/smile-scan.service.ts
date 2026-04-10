import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { SmileScanResult } from './smile-scan.model';

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
      map((body) => this.deepCloneResult(this.normalize(body))),
      catchError((err) => throwError(() => err?.error?.message ?? err?.message ?? 'Scan failed'))
    );
  }

  getByPatientId(externalPatientId: number): Observable<SmileScanResult[]> {
    if (!externalPatientId || externalPatientId <= 0) {
      return throwError(() => new Error('ExternalPatientId must be greater than 0.'));
    }
    return this.http.get<unknown>(`${this.apiUrl}/${externalPatientId}`).pipe(
      map((payload) => this.normalizeHistoryPayload(payload)),
      catchError((err) => throwError(() => err?.error?.message ?? err?.message ?? 'Failed to load scans'))
    );
  }

  private normalizeHistoryPayload(payload: unknown): SmileScanResult[] {
    if (payload == null) {
      return [];
    }
    const scanObjects = this.extractScanObjects(payload);
    if (scanObjects.length === 0 && this.hasUnexpectedPayload(payload)) {
      throw new Error('Invalid scans response format. Expected JSON scan list.');
    }
    return scanObjects.map((x) => this.deepCloneResult(this.normalize(x)));
  }

  private looksLikeSmileScan(body: Record<string, unknown>): boolean {
    return (
      body['smileScore'] !== undefined ||
      body['SmileScore'] !== undefined ||
      body['confidenceScore'] !== undefined ||
      body['ConfidenceScore'] !== undefined
    );
  }

  private extractScanObjects(payload: unknown): Record<string, unknown>[] {
    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload) as unknown;
        return this.extractScanObjects(parsed);
      } catch {
        throw new Error('Server returned non-JSON response for scan history.');
      }
    }

    if (Array.isArray(payload)) {
      return payload.flatMap((item) => this.extractScanObjects(item));
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const obj = payload as Record<string, unknown>;
    if (this.looksLikeSmileScan(obj)) {
      return [obj];
    }

    const directArray = this.getFirstArrayByKeys(obj, ['data', 'items', 'results', 'value', '$values']);
    if (directArray) {
      return directArray.flatMap((item) => this.extractScanObjects(item));
    }

    // Fallback: search nested objects/arrays one level deeper (handles wrapped API envelopes).
    const nestedValues = Object.values(obj);
    for (const value of nestedValues) {
      const nested = this.extractScanObjects(value);
      if (nested.length > 0) {
        return nested;
      }
    }

    return [];
  }

  private hasUnexpectedPayload(payload: unknown): boolean {
    if (Array.isArray(payload)) return false;
    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      return !(trimmed === '' || trimmed === '[]' || trimmed === '{}');
    }
    if (payload && typeof payload === 'object') {
      const keys = Object.keys(payload as Record<string, unknown>);
      return keys.length > 0;
    }
    return false;
  }

  private getFirstArrayByKeys(
    obj: Record<string, unknown>,
    keys: string[]
  ): unknown[] | null {
    for (const key of keys) {
      const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase());
      if (!foundKey) continue;
      const value = obj[foundKey];
      if (Array.isArray(value)) return value;
    }
    return null;
  }

  private normalize(body: Record<string, unknown>): SmileScanResult {
    const get = (camel: string) => {
      const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
      return body[camel] ?? body[pascal];
    };
    const createdRaw = get('createdAt');
    const createdAt =
      createdRaw != null && String(createdRaw).trim() !== '' ? String(createdRaw) : null;
    return {
      smileScore: Number(get('smileScore')) || 0,
      alignmentScore: Number(get('alignmentScore')) || 0,
      gumHealthScore: Number(get('gumHealthScore')) || 0,
      whitenessScore: Number(get('whitenessScore')) || 0,
      symmetryScore: Number(get('symmetryScore')) || 0,
      plaqueRiskLevel: String(get('plaqueRiskLevel') ?? ''),
      confidenceScore: Number(get('confidenceScore')) || 0,
      recommendations: Array.isArray(get('recommendations')) ? (get('recommendations') as string[]) : [],
      imageUrl: this.pickImageUrl(body),
      createdAt
    };
  }

  /** Match SmileIntelligenceFE / backend: support camel + Pascal + relative paths. */
  private pickImageUrl(body: Record<string, unknown>): string | null {
    const keys = [
      'imageUrl',
      'ImageUrl',
      'imageURL',
      'scanImageUrl',
      'ScanImageUrl',
      'photoUrl',
      'PhotoUrl',
      'image',
      'Image'
    ];
    for (const k of keys) {
      const v = body[k];
      if (v == null) continue;
      if (typeof v === 'string') {
        const t = v.trim();
        if (t !== '') return this.resolveAssetUrl(t);
      }
    }
    return null;
  }

  private resolveAssetUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) {
      const proto =
        typeof globalThis !== 'undefined' &&
        'location' in globalThis &&
        (globalThis as { location?: { protocol?: string } }).location?.protocol
          ? (globalThis as { location: { protocol: string } }).location.protocol
          : 'https:';
      return `${proto}${url}`;
    }
    const apiBase = API_CONFIG.baseUrl.replace(/\/$/, '');
    if (url.startsWith('/')) {
      if (apiBase) return `${apiBase}${url}`;
      if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
        const origin = (globalThis as { location: { origin: string } }).location.origin;
        return `${origin.replace(/\/$/, '')}${url}`;
      }
    }
    return url;
  }

  private deepCloneResult(r: SmileScanResult): SmileScanResult {
    return {
      ...r,
      recommendations: Array.isArray(r.recommendations) ? [...r.recommendations] : []
    };
  }
}
