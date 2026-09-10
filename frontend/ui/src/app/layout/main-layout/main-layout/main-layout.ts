import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoggedInUser } from '../../../core/services/auth.service';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {

  currentUser: LoggedInUser | null = null;
currentYear = new Date().getFullYear();
  sidebarOpen = true;
  showLogoutModal = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
  }

  getUserInitials(): string {
    if (!this.currentUser?.full_name) {
      return 'U';
    }

    const names = this.currentUser.full_name
      .trim()
      .split(' ')
      .filter(Boolean);

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0) +
      names[names.length - 1].charAt(0)
    ).toUpperCase();
  }

  getRoleLabel(): string {
    return this.currentUser?.role || 'USER';
  }

  closeMobileSidebar(): void {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }
}