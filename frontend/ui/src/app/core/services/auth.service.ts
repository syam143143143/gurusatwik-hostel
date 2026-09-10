import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { API_CONFIG } from './api.config';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoggedInUser {
  user_id: number;
  username: string;
  full_name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: LoggedInUser;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${API_CONFIG.baseUrl}/auth`;

  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {

          if (
            response.success &&
            response.data &&
            isPlatformBrowser(this.platformId)
          ) {

            localStorage.setItem(
              this.TOKEN_KEY,
              response.data.token
            );

            localStorage.setItem(
              this.USER_KEY,
              JSON.stringify(response.data.user)
            );
          }

        })
      );
  }

  logout(): void {

    if (isPlatformBrowser(this.platformId)) {

      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);

    }

    this.router.navigate(['/login']);
  }

  getToken(): string | null {

    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): LoggedInUser | null {

    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const user = localStorage.getItem(this.USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as LoggedInUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {

    const user = this.getCurrentUser();

    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {

    const user = this.getCurrentUser();

    if (!user) {
      return false;
    }

    return roles.includes(user.role);
  }
}