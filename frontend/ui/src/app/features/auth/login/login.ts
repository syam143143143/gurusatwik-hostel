import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthService,
  LoginRequest
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  username = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    this.errorMessage = '';

    if (!this.username.trim()) {
      this.errorMessage = 'Username is required';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Password is required';
      return;
    }

    const credentials: LoginRequest = {
      username: this.username.trim(),
      password: this.password
    };

    this.loading = true;

    this.authService.login(credentials).subscribe({
      next: response => {

        this.loading = false;

        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage =
            response.message || 'Login failed';
        }
      },

      error: error => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Invalid username or password';
      }
    });
  }
}