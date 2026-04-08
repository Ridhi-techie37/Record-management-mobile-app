import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientVisitService, PatientVisit, PatientTreatment } from '../../services/patient-visit.service';

const DEFAULT_PAGE_SIZE = 20;

@Component({
  selector: 'app-patient-visits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-visits.html',
  styleUrl: './patient-visits.css'
})
export class PatientVisits implements OnInit {
  records: PatientVisit[] = [];
  loading = true;
  error = '';
  isNetworkError = false;
  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  totalCount = 0;
  totalPages = 1;
  /** True only after user has clicked Search; until then we show only "Search the patient" and no grid */
  hasSearched = false;
  /** Optional Patient ID to filter visits (from search box); passed to API */
  filterPatientId: number | null = null;
  /** Raw value for optional Patient ID input */
  patientIdInput = '';
  /** visitId -> list of treatments for that visit (from GET all treatments, filtered by visit) */
  treatmentsByVisitId = new Map<number, PatientTreatment[]>();
  showTreatmentModal = false;
  selectedVisit: PatientVisit | null = null;
  /** In-page image viewer (lightbox) – object URL and title; null when closed */
  viewerImageUrl: string | null = null;
  viewerTitle = '';

  hasTreatmentsForVisit(visitId: number): boolean {
    const list = this.treatmentsByVisitId.get(visitId);
    return (list?.length ?? 0) > 0;
  }

  getTreatmentsForVisit(visitId: number): PatientTreatment[] {
    return this.treatmentsByVisitId.get(visitId) ?? [];
  }

  constructor(
    private patientVisitService: PatientVisitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loading = false;
  }

  /** User clicked Search: show grid and load visits (optional filter by Patient ID). */
  onSearch() {
    const id = this.patientIdInput.trim();
    this.filterPatientId = id ? parseInt(id, 10) : null;
    if (id && (isNaN(this.filterPatientId!) || this.filterPatientId! < 1)) {
      this.filterPatientId = null;
    }
    this.hasSearched = true;
    this.loadPage(1);
  }

  loadPage(pageNumber: number) {
    this.loading = true;
    this.error = '';
    this.isNetworkError = false;
    this.treatmentsByVisitId.clear();
    this.cdr.detectChanges();

    this.patientVisitService.getPatientVisitsPaged(pageNumber, this.pageSize, this.filterPatientId).subscribe({
      next: (paged) => {
        this.records = paged.patientVisit ?? [];
        this.totalCount = paged.totalCount;
        this.totalPages = Math.max(1, paged.totalPages ?? Math.ceil(this.totalCount / this.pageSize));
        this.currentPage = paged.pageNumber ?? pageNumber;
        this.loadTreatmentsAndApply();
      },
      error: (err) => {
        this.isNetworkError = err?.status === 0 || err?.status === undefined;
        if (this.isNetworkError) {
          this.error = 'Unable to connect. Please check the backend and your connection.';
        } else {
          this.error = err?.error?.message || err?.message || 'Failed to load patient visits';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  prevPage() {
    if (this.currentPage > 1) this.loadPage(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.loadPage(this.currentPage + 1);
  }

  get fromRecord(): number {
    if (this.totalCount === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get toRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  private loadTreatmentsAndApply() {
    this.patientVisitService.getAllTreatments().subscribe({
      next: (all) => {
        const map = new Map<number, PatientTreatment[]>();
        for (const t of all ?? []) {
          const vid = t.patientVisitId;
          if (!map.has(vid)) map.set(vid, []);
          map.get(vid)!.push(t);
        }
        this.treatmentsByVisitId = map;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openTreatmentModal(rec: PatientVisit) {
    if (!this.hasTreatmentsForVisit(rec.id)) return;
    this.selectedVisit = rec;
    this.showTreatmentModal = true;
    this.cdr.detectChanges();
  }

  closeTreatmentModal() {
    this.showTreatmentModal = false;
    this.selectedVisit = null;
    this.cdr.detectChanges();
  }

  formatDate(value: string | undefined | unknown): string {
    if (value == null || value === '') return '-';
    const str = typeof value === 'string' ? value : String(value);
    if (str.includes('T')) return str.split('T')[0] || str;
    return str || '-';
  }

  formatTime(value: string | undefined | unknown): string {
    if (value == null) return '-';
    const str = typeof value === 'string' ? value : String(value);
    if (str.includes('.')) return str.split('.')[0] || str;
    return str || '-';
  }

  /**
   * Parse base64 or data URL into binary and mime type.
   * Returns null if input is invalid (avoids long data URLs that break window.open/download).
   */
  private base64ToBlob(input: string | undefined | null): { blob: Blob; mime: string } | null {
    if (!input || typeof input !== 'string') return null;
    const s = input.trim();
    if (!s) return null;

    let base64: string;
    let mime = 'image/jpeg';

    if (s.toLowerCase().startsWith('data:')) {
      const match = s.match(/^data:([^;]+);base64,(.+)$/i);
      if (!match) return null;
      mime = match[1].trim().toLowerCase();
      base64 = match[2];
    } else {
      base64 = s;
    }

    base64 = base64.replace(/\s/g, '');
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return { blob: new Blob([bytes], { type: mime }), mime };
    } catch {
      return null;
    }
  }

  /** Open image in in-page viewer (lightbox) with close/back so user can return. */
  openImageViewer(base64: string | undefined | null, title: string): void {
    this.closeImageViewer();
    const parsed = this.base64ToBlob(base64);
    if (!parsed) return;
    this.viewerImageUrl = URL.createObjectURL(parsed.blob);
    this.viewerTitle = title || 'Image';
    this.cdr.detectChanges();
  }

  closeImageViewer(): void {
    if (this.viewerImageUrl) {
      URL.revokeObjectURL(this.viewerImageUrl);
      this.viewerImageUrl = null;
    }
    this.viewerTitle = '';
    this.cdr.detectChanges();
  }
}
