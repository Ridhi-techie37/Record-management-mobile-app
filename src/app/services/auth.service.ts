import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { API_CONFIG } from '../config/api.config';

const TOKEN_KEY = 'token';
const LOGGED_IN_PATIENT_ID_KEY = 'loggedInPatientId';
const LOGGED_IN_ROLE_KEY = 'loggedInRole';

export type AppUserRole = 'superadmin' | 'patient' | 'other';

export interface LoginResponse {
  accessToken: string;
  expiration?: string;
  userId?: number;
  username?: string;
  role?: { id?: number; iD?: number; name?: string } | string | null;
  patientId?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = API_CONFIG.baseUrl;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  login(data: { username: string; passwordHash: string }) {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}${API_CONFIG.endpoints.login}`,
      data
    );
  }

  patientLogin(data: { patientId: number; phoneNumber: string }) {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}${API_CONFIG.endpoints.patientLogin}`,
      data
    );
  }

  /** Store token and optional patient id after successful login. */
  persistLoginSession(res: LoginResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(TOKEN_KEY, res.accessToken);

    const normalizedRole = this.normalizeRole(this.extractRoleName(res.role));
    localStorage.setItem(LOGGED_IN_ROLE_KEY, normalizedRole);

    const pid = res.patientId;
    if (pid != null && pid > 0) {
      localStorage.setItem(LOGGED_IN_PATIENT_ID_KEY, String(pid));
    } else {
      localStorage.removeItem(LOGGED_IN_PATIENT_ID_KEY);
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LOGGED_IN_PATIENT_ID_KEY);
      localStorage.removeItem(LOGGED_IN_ROLE_KEY);
    }
  }

  isLoggedIn(): boolean {
    return isPlatformBrowser(this.platformId) && !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(TOKEN_KEY) : null;
  }

  /** Patient id when the user logged in with patient credentials; null for staff or legacy sessions. */
  getLoggedInPatientId(): number | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem(LOGGED_IN_PATIENT_ID_KEY);
    if (raw == null || raw.trim() === '') return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  getLoggedInRole(): AppUserRole {
    if (!isPlatformBrowser(this.platformId)) return 'other';
    const roleRaw = localStorage.getItem(LOGGED_IN_ROLE_KEY) ?? '';
    const normalized = this.normalizeRole(roleRaw);
    return normalized;
  }

  isPatientUser(): boolean {
    return this.getLoggedInRole() === 'patient';
  }

  isSuperAdminUser(): boolean {
    return this.getLoggedInRole() === 'superadmin';
  }

  private extractRoleName(role: LoginResponse['role']): string {
    if (typeof role === 'string') return role;
    if (role && typeof role === 'object') {
      const roleObj = role as { name?: string; Name?: string };
      return roleObj.name ?? roleObj.Name ?? '';
    }
    return '';
  }

  private normalizeRole(input: string | null | undefined): AppUserRole {
    const normalized = (input ?? '').replace(/\s+/g, '').toLowerCase();
    if (normalized === 'patient') return 'patient';
    if (normalized === 'superadmin') return 'superadmin';
    return 'other';
  }
}
