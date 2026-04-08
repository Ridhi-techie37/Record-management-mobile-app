import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentService, Department } from '../../services/department.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departments.html',
  styleUrl: './departments.css'
})
export class Departments {
  departments: Department[] = [];
  loading = true;
  error = '';

  constructor(
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadDepartments();
  }

  loadDepartments() {
    this.loading = true;
    this.error = '';
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.departments = (data ?? []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load departments';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
