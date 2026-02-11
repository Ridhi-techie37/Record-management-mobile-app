import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private BASE_URL = 'https://localhost:51099';

  constructor(private http: HttpClient) { }

  login(data: any) {
    return this.http.post(
      `${this.BASE_URL}/api/Auth/login`,
      data
    );
  }
}
