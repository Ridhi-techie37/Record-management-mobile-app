import { Component, EventEmitter, Output, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SmileScanService } from '../../../services/smile-intelligence/smile-scan.service';
import { SmileScanRecord, SmileScanResult } from '../../../services/smile-intelligence/smile-scan.model';
import { ScanHistoryService } from '../../../services/smile-intelligence/scan-history.service';
import {
  cloneSmileScanResult,
  formatCreatedAt,
  formatDateShort,
  getScoreColor,
  remoteScanTrackId
} from '../smile-intelligence.utils';

@Component({
  selector: 'app-smile-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smile-history.component.html',
  styleUrl: '../smile-intelligence.css',
  encapsulation: ViewEncapsulation.None
})
export class SmileHistoryComponent {
  @Output() readonly openResult = new EventEmitter<SmileScanRecord>();
  @Output() readonly goCapture = new EventEmitter<void>();

  externalPatientId: number | null = null;
  historyLoading = false;
  historyError = '';
  remoteScans: SmileScanResult[] = [];
  remoteSortNewestFirst = true;
  fetchedForPatientId: number | null = null;
  hasSearchedHistory = false;

  readonly getScoreColor = getScoreColor;
  readonly formatDateShort = formatDateShort;
  readonly formatCreatedAt = formatCreatedAt;
  readonly trackRemote = remoteScanTrackId;

  constructor(
    private readonly smileScanService: SmileScanService,
    private readonly scanHistory: ScanHistoryService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get localRecords(): SmileScanRecord[] {
    return this.scanHistory.getAll();
  }

  get sortedRemoteScans(): SmileScanResult[] {
    return [...this.remoteScans].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return this.remoteSortNewestFirst ? tb - ta : ta - tb;
    });
  }

  onPatientIdInput(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const v = target?.value;
    this.externalPatientId = v && v.trim() !== '' ? +v : null;
  }

  loadHistory(): void {
    this.historyError = '';
    this.remoteScans = [];

    if (!this.externalPatientId || this.externalPatientId <= 0) {
      this.historyError = 'Please enter a valid Patient ID (> 0).';
      return;
    }

    const patientId = this.externalPatientId;
    this.historyLoading = true;
    this.hasSearchedHistory = true;

    this.smileScanService
      .getByPatientId(patientId)
      .pipe(
        finalize(() => {
          this.historyLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (items) => {
          try {
            this.fetchedForPatientId = patientId;
            this.remoteScans = Array.isArray(items) ? items : [];
            this.cdr.detectChanges();
          } catch (e) {
            this.historyError = e instanceof Error ? e.message : 'Failed to render history results';
          }
        },
        error: (err) => {
          this.historyError = typeof err === 'string' ? err : err?.message || 'Failed to load history';
        }
      });
  }

  toggleRemoteSort(): void {
    this.remoteSortNewestFirst = !this.remoteSortNewestFirst;
  }

  openRemoteScan(scan: SmileScanResult): void {
    const snapshot = cloneSmileScanResult(scan);
    const added = this.scanHistory.add({
      ...snapshot,
      externalPatientId: this.fetchedForPatientId ?? undefined,
      imageDataUrl: undefined
    });
    this.openResult.emit(added);
  }

  openHistoryRecord(record: SmileScanRecord): void {
    this.openResult.emit(record);
  }

  clearHistory(): void {
    this.scanHistory.clear();
    this.cdr.detectChanges();
  }
}
