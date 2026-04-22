import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const token = isPlatformBrowser(platformId) ? localStorage.getItem('token') : null;

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const url = req.url || '';
      const isLoginCall = url.includes('/api/Auth/login');
      const isSmileCall = url.includes('/api/v1/smile-scans');

      // For Smile APIs, do not hard-redirect to login on 401.
      // Let the page show a local error so user can retry.
      if (err.status === 401 && isPlatformBrowser(platformId) && !isLoginCall && !isSmileCall) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
