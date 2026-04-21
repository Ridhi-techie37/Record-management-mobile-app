import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PatientTreatmentMasterItem,
  PatientTreatmentMasterService
} from '../../services/patient-treatment-master.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-treatments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-treatments.html',
  styleUrl: './patient-treatments.css'
})
export class PatientTreatments implements OnInit {
  items: PatientTreatmentMasterItem[] = [];
  loading = false;
  error = '';
  patientIdInput = '';
  hasSearched = false;
  readonly isPatientUser: boolean;
  readonly loggedInPatientId: number | null;

  constructor(
    private patientTreatmentMasterService: PatientTreatmentMasterService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.isPatientUser = this.auth.isPatientUser();
    this.loggedInPatientId = this.auth.getLoggedInPatientId();
  }

  ngOnInit(): void {
    if (this.isPatientUser && this.loggedInPatientId && this.loggedInPatientId > 0) {
      this.patientIdInput = String(this.loggedInPatientId);
      this.loadTreatmentsByPatientId(this.loggedInPatientId);
      return;
    }
    this.loading = false;
  }

  onSearch(): void {
    if (this.isPatientUser && this.loggedInPatientId && this.loggedInPatientId > 0) {
      this.patientIdInput = String(this.loggedInPatientId);
      this.loadTreatmentsByPatientId(this.loggedInPatientId);
      return;
    }

    const id = parseInt(this.patientIdInput.trim(), 10);
    if (isNaN(id) || id < 1) {
      this.error = 'Please enter a valid Patient ID.';
      this.hasSearched = true;
      this.items = [];
      this.cdr.detectChanges();
      return;
    }

    this.loadTreatmentsByPatientId(id);
  }

  onClear(): void {
    if (this.isPatientUser) return;
    this.patientIdInput = '';
    this.items = [];
    this.error = '';
    this.hasSearched = false;
    this.cdr.detectChanges();
  }

  formatDate(value: string | undefined | null): string {
    if (!value) return '-';
    if (value.includes('T')) return value.split('T')[0] || value;
    return value;
  }

  private loadTreatmentsByPatientId(patientId: number): void {
    this.loading = true;
    this.error = '';
    this.hasSearched = true;
    this.items = [];
    this.cdr.detectChanges();

    this.patientTreatmentMasterService.getByPatientId(patientId).subscribe({
      next: (list) => {
        this.items = list ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load patient treatments';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
