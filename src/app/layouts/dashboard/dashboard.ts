import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FEATURE_FLAGS } from '../../config/feature-flags.config';
import { Home } from '../../pages/home/home';
import { Employees } from '../../pages/employees/employees';
import { Departments } from '../../pages/departments/departments';
import { AttendancePage } from '../../pages/attendance/attendance';
import { Patients } from '../../pages/patients/patients';
import { PatientVisits } from '../../pages/patient-visits/patient-visits';
import { PatientTreatments } from '../../pages/patient-treatments/patient-treatments';

type DashboardView = 'home' | 'employees' | 'departments' | 'attendance' | 'patients' | 'patient-visits' | 'patient-treatments';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Home, Employees, Departments, AttendancePage, Patients, PatientVisits, PatientTreatments],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnDestroy {
  sidebarOpen = false;
  currentView: DashboardView = 'home';
  readonly showPatientFeatures = FEATURE_FLAGS.showPatientFeatures;
  private routerSub: Subscription | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
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

  private updateViewFromUrl(url: string): void {
    const path = url.split('?')[0];
    if (path.endsWith('patient-treatments') || path.includes('/patient-treatments')) {
      if (this.showPatientFeatures) {
        this.currentView = 'patient-treatments';
      } else {
        this.currentView = 'home';
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    } else if (path.endsWith('patient-visits') || path.includes('/patient-visits')) {
      if (this.showPatientFeatures) {
        this.currentView = 'patient-visits';
      } else {
        this.currentView = 'home';
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    } else if (path.endsWith('patients') || path.includes('/patients')) {
      if (this.showPatientFeatures) {
        this.currentView = 'patients';
      } else {
        this.currentView = 'home';
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    } else if (path.endsWith('attendance') || path.includes('/attendance')) {
      if (this.showPatientFeatures) {
        this.currentView = 'home';
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      } else {
        this.currentView = 'attendance';
      }
    } else if (path.endsWith('employees') || path.includes('/employees')) {
      if (this.showPatientFeatures) {
        this.currentView = 'home';
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      } else {
        this.currentView = 'employees';
      }
    } else if (path.endsWith('departments') || path.includes('/departments')) {
      if (this.showPatientFeatures) {
        this.currentView = 'home';
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      } else {
        this.currentView = 'departments';
      }
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
