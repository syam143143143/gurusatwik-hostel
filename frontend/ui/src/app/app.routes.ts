import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ==============================
  // LOGIN - PUBLIC ROUTE
  // ==============================
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },

  // ==============================
  // PROTECTED APPLICATION
  // ==============================
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],

    children: [

      // ==============================
      // DEFAULT ROUTE
      // ==============================
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // ==============================
      // DASHBOARD
      // ==============================
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      },

      // ==============================
      // STUDENTS
      // ==============================
      {
        path: 'students',
        loadComponent: () =>
          import('./features/students/students')
            .then(m => m.Students)
      },

      // ==============================
      // ROOMS
      // ==============================
      {
        path: 'rooms',
        loadComponent: () =>
          import('./features/rooms/rooms/rooms')
            .then(m => m.Rooms)
      },

      // ==============================
      // ALLOCATION
      // ==============================
      {
        path: 'allocation',
        loadComponent: () =>
          import('./features/allocations/allocation/allocation')
            .then(m => m.Allocations)
      },

      // ==============================
      // FEES
      // ==============================
      {
        path: 'fees',
        loadComponent: () =>
          import('./features/fees/fees/fees')
            .then(m => m.Fees)
      },

      // ==============================
      // PAYMENTS
      // ==============================
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/payments/payments')
            .then(m => m.Payments)
      },

      // ==============================
      // REPORTS
      // ==============================
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports/reports')
            .then(m => m.Reports)
      }

    ]
  },

  // ==============================
  // UNKNOWN ROUTES
  // ==============================
  {
    path: '**',
    redirectTo: 'dashboard'
  }

];