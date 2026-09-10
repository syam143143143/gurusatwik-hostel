import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardData } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  dashboard: DashboardData | null = null;

  loading = false;

  errorMessage = '';

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboard().subscribe({

      next: (response) => {

        if (response.success) {

          this.dashboard = response.data;

        } else {

          this.errorMessage =
            'Failed to load dashboard';

        }

        this.loading = false;
      },

      error: (error) => {

        console.error(
          'Dashboard API error:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to connect to server';

        this.loading = false;
      }

    });
  }
}