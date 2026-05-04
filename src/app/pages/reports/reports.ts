import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportItem, ReportService, ReportType } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  readonly reportTypes: { label: string; value: ReportType }[] = [
    { label: 'Income Report', value: 'income' },
    { label: 'Treatment Report', value: 'treatment' },
    { label: 'Patient Report', value: 'patient' }
  ];

  selectedReportType: ReportType = 'income';
  startDate = '';
  endDate = '';
  loading = false;
  error = '';
  message = 'Select a date range and click Generate Report to view treatment report.';
  items: ReportItem[] = [];
  hasGenerated = false;
  sumCount = 0;
  sumPatients = 0;
  sumTotalIncome = 0;

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(today);
  }

  generateReport(): void {
    this.error = '';
    this.hasGenerated = true;

    if (!this.startDate || !this.endDate) {
      this.error = 'Please select both Start Date and End Date.';
      this.items = [];
      this.cdr.detectChanges();
      return;
    }

    if (this.startDate > this.endDate) {
      this.error = 'Start Date must not be after End Date.';
      this.items = [];
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.items = [];
    this.cdr.detectChanges();

    this.reportService.getReport(this.startDate, this.endDate).subscribe({
      next: (result) => {
        this.loading = false;
        this.items = result ?? [];
        this.calculateTotals();

        if (this.items.length === 0) {
          this.message = 'No report data for the selected date range.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.items = [];
        this.calculateTotals();
        this.error = err?.error?.message || err?.message || 'Failed to load report.';
        this.cdr.detectChanges();
      }
    });
  }

  showColumn(column: 'count' | 'patients' | 'totalIncome'): boolean {
    if (column === 'count') {
      return this.selectedReportType === 'income' || this.selectedReportType === 'treatment';
    }
    if (column === 'patients') {
      return this.selectedReportType === 'patient';
    }
    return this.selectedReportType === 'income';
  }

  private calculateTotals(): void {
    this.sumCount = this.items.reduce((sum, item) => sum + (item.count || 0), 0);
    this.sumPatients = this.items.reduce((sum, item) => sum + (item.patients || 0), 0);
    this.sumTotalIncome = this.items.reduce((sum, item) => sum + (item.totalIncome || 0), 0);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
