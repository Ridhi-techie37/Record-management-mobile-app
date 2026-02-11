import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService) { }

  onLogin() {
    this.authService.login({
      username: this.username,
      passwordHash: this.password
    }).subscribe({
      next: (res: any) => {
        console.log(res);
        localStorage.setItem('token', res.token);
      },
      error: () => {
        this.error = 'Invalid credentials';
      }
    });
  }
}
