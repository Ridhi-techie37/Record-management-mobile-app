import { Injectable } from '@angular/core';
import { SmileScanRecord } from './smile-scan.model';

const STORAGE_KEY = 'smile_intelligence_scan_history';

@Injectable({
  providedIn: 'root'
})
export class ScanHistoryService {
  private records: SmileScanRecord[] = this.loadFromStorage();

  getAll(): SmileScanRecord[] {
    return [...this.records].sort(
      (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
  }

  add(record: Omit<SmileScanRecord, 'id' | 'scannedAt'>): SmileScanRecord {
    const full: SmileScanRecord = {
      ...record,
      recommendations: Array.isArray(record.recommendations) ? [...record.recommendations] : [],
      id: this.generateId(),
      scannedAt: new Date()
    };
    this.records.unshift(full);
    this.persist();
    return full;
  }

  getById(id: string): SmileScanRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  clear(): void {
    this.records = [];
    this.persist();
  }

  private generateId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private loadFromStorage(): SmileScanRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as (SmileScanRecord & { scannedAt: string })[];
      return parsed.map((r) => ({
        ...r,
        scannedAt: new Date(r.scannedAt)
      }));
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      const toStore = this.records.map((r) => ({
        ...r,
        scannedAt: r.scannedAt.toISOString(),
        imageDataUrl: undefined
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // ignore
    }
  }
}
