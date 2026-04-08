import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService, Attendance } from '../../services/attendance.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class AttendancePage implements OnInit {
  records: Attendance[] = [];
  loading = true;
  error = '';
  isNetworkError = false;

  constructor(
    private attendanceService: AttendanceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAttendance();
  }

  loadAttendance() {
    this.loading = true;
    this.error = '';
    this.isNetworkError = false;
    this.cdr.detectChanges();

    this.attendanceService.getAttendance().subscribe({
      next: (data) => {
        this.records = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isNetworkError = err?.status === 0 || err?.status === undefined;
        if (this.isNetworkError) {
          this.error = 'Unable to connect. Please check the backend and your connection.';
        } else {
          this.error = err?.error?.message || err?.message || 'Failed to load attendance';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatTime(value: string | undefined | unknown): string {
    if (value == null) return '-';
    const str = typeof value === 'string' ? value : String(value);
    if (str.includes('.')) {
      return str.split('.')[0] || str;
    }
    return str || '-';
  }
}
