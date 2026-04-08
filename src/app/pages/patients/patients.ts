import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService, Patient } from '../../services/patient.service';

const DEFAULT_PAGE_SIZE = 20;

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class Patients {
  patients: Patient[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  totalCount = 0;
  totalPages = 1;

  constructor(
    private patientService: PatientService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadPage(1);
  }

  loadPage(pageNumber: number) {
    this.loading = true;
    this.error = '';
    const search = this.searchQuery.trim() || undefined;
    this.patientService.getPatientsPaged(pageNumber, this.pageSize, search ?? null).subscribe({
      next: (paged) => {
        this.patients = paged.patientMasterData ?? [];
        this.totalCount = paged.totalCount;
        this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
        this.currentPage = pageNumber;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load patients';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.loadPage(1);
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
}
