import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.error = '';
    const loginRequest = {
      username: this.username,
      passwordHash: this.password
    };

    this.authService.login(loginRequest).pipe(
      catchError((err) => {
        const maybePatientId = Number.parseInt((this.username ?? '').trim(), 10);
        const canTryPatientLogin = Number.isFinite(maybePatientId) && maybePatientId > 0;
        if (err?.status !== 401 || !canTryPatientLogin) {
          return throwError(() => err);
        }

        return this.authService.patientLogin({
          patientId: maybePatientId,
          phoneNumber: this.password
        });
      }),
      switchMap((res) => {
        this.authService.persistLoginSession(res);
        return this.router.navigate(['/dashboard']);
      })
    ).subscribe({
      next: () => {},
      error: () => {
        this.error = 'Invalid credentials';
      }
    });
  }
}
