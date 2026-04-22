import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './layouts/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'dashboard/employees', component: Dashboard, canActivate: [authGuard] },
  { path: 'dashboard/departments', component: Dashboard, canActivate: [authGuard] },
  { path: 'dashboard/attendance', component: Dashboard, canActivate: [authGuard] },
  { path: 'dashboard/patients', component: Dashboard, canActivate: [authGuard] },
  { path: 'dashboard/patient-visits', component: Dashboard, canActivate: [authGuard] },
  { path: 'dashboard/patient-treatments', component: Dashboard, canActivate: [authGuard] },
  { path: 'dashboard/smile-intelligence', component: Dashboard, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
