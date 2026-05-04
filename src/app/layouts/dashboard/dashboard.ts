import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Home } from '../../pages/home/home';
import { Employees } from '../../pages/employees/employees';
import { Departments } from '../../pages/departments/departments';
import { AttendancePage } from '../../pages/attendance/attendance';
import { Patients } from '../../pages/patients/patients';
import { PatientVisits } from '../../pages/patient-visits/patient-visits';
import { PatientTreatments } from '../../pages/patient-treatments/patient-treatments';
import { SmileIntelligence } from '../../pages/smile-intelligence/smile-intelligence';
import { Reports } from '../../pages/reports/reports';

type DashboardView = 'home' | 'employees' | 'departments' | 'attendance' | 'patients' | 'patient-visits' | 'patient-treatments' | 'reports' | 'smile-intelligence';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Home, Employees, Departments, AttendancePage, Patients, PatientVisits, PatientTreatments, Reports, SmileIntelligence],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnDestroy {
  sidebarOpen = false;
  currentView: DashboardView = 'home';
  readonly isPatientUser: boolean;
  readonly isSuperAdminUser: boolean;
  private routerSub: Subscription | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isPatientUser = this.auth.isPatientUser();
    this.isSuperAdminUser = this.auth.isSuperAdminUser();
    this.updateViewFromUrl(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateViewFromUrl(this.router.url);
      this.closeSidebar();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  get headerTitle(): string {
    switch (this.currentView) {
      case 'patients':
        return 'Patients';
      case 'patient-visits':
        return 'Patient Visits';
      case 'patient-treatments':
        return 'Patient Treatments';
      case 'smile-intelligence':
        return 'Smile Intelligence';
      case 'reports':
        return 'Report';
      case 'employees':
        return 'Employees';
      case 'departments':
        return 'Departments';
      case 'attendance':
        return 'Attendance';
      default:
        return 'Patient Record';
    }
  }

  private updateViewFromUrl(url: string): void {
    const path = url.split('?')[0];
    if (this.isPatientUser) {
      if (path.endsWith('patient-treatments') || path.includes('/patient-treatments')) {
        this.currentView = 'patient-treatments';
      } else if (path.endsWith('smile-intelligence') || path.includes('/smile-intelligence')) {
        this.currentView = 'smile-intelligence';
      } else {
        this.currentView = 'patient-treatments';
        this.router.navigate(['/dashboard/patient-treatments'], { replaceUrl: true });
      }
      return;
    }

    if (path.endsWith('smile-intelligence') || path.includes('/smile-intelligence')) {
      this.currentView = 'smile-intelligence';
    } else if (path.endsWith('reports') || path.includes('/reports')) {
      if (this.isSuperAdminUser) {
        this.currentView = 'reports';
      } else {
        this.currentView = 'home';
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    } else if (path.endsWith('patient-treatments') || path.includes('/patient-treatments')) {
      this.currentView = 'patient-treatments';
    } else if (path.endsWith('patient-visits') || path.includes('/patient-visits')) {
      this.currentView = 'patient-visits';
    } else if (path.endsWith('patients') || path.includes('/patients')) {
      this.currentView = 'patients';
    } else {
      this.currentView = 'home';
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
