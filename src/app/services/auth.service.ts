import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = API_CONFIG.baseUrl;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  login(data: { username: string; passwordHash: string }) {
    return this.http.post<{ accessToken: string }>(
      `${this.baseUrl}${API_CONFIG.endpoints.login}`,
      data
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }

  isLoggedIn(): boolean {
    return isPlatformBrowser(this.platformId) && !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }
}
