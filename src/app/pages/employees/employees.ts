import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService, Employee } from '../../services/employee.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees {
  employees: Employee[] = [];
  loading = true;
  error = '';

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.error = '';
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load employees';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
