import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReportsService } from '../../../core/services/reports.service';

import {
  OccupancyReport,
  CollectionReport,
  PendingFeeReport,
  PaymentReport
} from '../../../core/models/report.model';

type ReportType =
  | 'occupancy'
  | 'collection'
  | 'pending'
  | 'payments';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports implements OnInit {

  // =====================================================
  // ACTIVE TAB
  // =====================================================

  activeReport: ReportType = 'occupancy';


  // =====================================================
  // LOADING / ERROR
  // =====================================================

  loading = false;
  errorMessage = '';


  // =====================================================
  // REPORT DATA
  // =====================================================

  occupancyData: OccupancyReport[] = [];
  collectionData: CollectionReport[] = [];
  pendingData: PendingFeeReport[] = [];
  paymentData: PaymentReport[] = [];


  // =====================================================
  // FILTERS
  // =====================================================

  fromDate = '';
  toDate = '';
  paymentMode = 'ALL';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly reportsService: ReportsService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadReport();
  }


  // =====================================================
  // TAB CHANGE
  // =====================================================

  selectReport(report: ReportType): void {

    if (this.activeReport === report && this.hasDataForReport(report)) {
      return;
    }

    this.activeReport = report;
    this.errorMessage = '';

    this.loadReport();
  }


  // =====================================================
  // LOAD CURRENT REPORT
  // =====================================================

  loadReport(): void {

    switch (this.activeReport) {

      case 'occupancy':
        this.loadOccupancy();
        break;

      case 'collection':
        this.loadCollection();
        break;

      case 'pending':
        this.loadPendingFees();
        break;

      case 'payments':
        this.loadPayments();
        break;
    }
  }


  // =====================================================
  // CHECK DATA
  // =====================================================

  private hasDataForReport(report: ReportType): boolean {

    switch (report) {

      case 'occupancy':
        return this.occupancyData.length > 0;

      case 'collection':
        return this.collectionData.length > 0;

      case 'pending':
        return this.pendingData.length > 0;

      case 'payments':
        return this.paymentData.length > 0;

      default:
        return false;
    }
  }


  // =====================================================
  // OCCUPANCY
  // =====================================================

  loadOccupancy(): void {

    this.loading = true;
    this.errorMessage = '';

    this.reportsService.getOccupancyReport().subscribe({

      next: (response) => {

        if (response?.success) {

          this.occupancyData = response.data || [];

        } else {

          this.occupancyData = [];

          this.errorMessage =
            'Unable to load occupancy report.';
        }

        this.loading = false;
      },

      error: (error) => {

        console.error(
          'Occupancy report error:',
          error
        );

        this.occupancyData = [];

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to load occupancy report.';
      }
    });
  }


  // =====================================================
  // MONTHLY COLLECTION
  // =====================================================

  loadCollection(): void {

    this.loading = true;
    this.errorMessage = '';

    this.reportsService
      .getMonthlyCollectionReport(
        this.fromDate || undefined,
        this.toDate || undefined
      )
      .subscribe({

        next: (response) => {

          if (response?.success) {

            this.collectionData =
              response.data || [];

          } else {

            this.collectionData = [];

            this.errorMessage =
              'Unable to load collection report.';
          }

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Collection report error:',
            error
          );

          this.collectionData = [];

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load collection report.';
        }
      });
  }


  // =====================================================
  // PENDING FEES
  // =====================================================

  loadPendingFees(): void {

    this.loading = true;
    this.errorMessage = '';

    this.reportsService
      .getPendingFeesReport()
      .subscribe({

        next: (response) => {

          if (response?.success) {

            this.pendingData =
              response.data || [];

          } else {

            this.pendingData = [];

            this.errorMessage =
              'Unable to load pending fees report.';
          }

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Pending fees report error:',
            error
          );

          this.pendingData = [];

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load pending fees report.';
        }
      });
  }


  // =====================================================
  // PAYMENTS
  // =====================================================

  loadPayments(): void {

    this.loading = true;
    this.errorMessage = '';

    this.reportsService
      .getPaymentReport(
        this.fromDate || undefined,
        this.toDate || undefined,
        this.paymentMode
      )
      .subscribe({

        next: (response) => {

          if (response?.success) {

            this.paymentData =
              response.data || [];

          } else {

            this.paymentData = [];

            this.errorMessage =
              'Unable to load payment report.';
          }

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Payment report error:',
            error
          );

          this.paymentData = [];

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load payment report.';
        }
      });
  }


  // =====================================================
  // APPLY FILTER
  // =====================================================

  applyDateFilter(): void {

    if (
      this.fromDate &&
      this.toDate &&
      this.fromDate > this.toDate
    ) {

      this.errorMessage =
        'From date cannot be greater than To date.';

      return;
    }

    this.errorMessage = '';

    if (this.activeReport === 'collection') {
      this.loadCollection();
    }

    if (this.activeReport === 'payments') {
      this.loadPayments();
    }
  }


  // =====================================================
  // CLEAR FILTER
  // =====================================================

  clearFilters(): void {

    this.fromDate = '';
    this.toDate = '';
    this.paymentMode = 'ALL';
    this.errorMessage = '';

    if (this.activeReport === 'collection') {
      this.loadCollection();
    }

    if (this.activeReport === 'payments') {
      this.loadPayments();
    }
  }


  // =====================================================
  // TOTAL ROOMS
  // =====================================================

  get totalRooms(): number {
    return this.occupancyData.length;
  }


  // =====================================================
  // TOTAL CAPACITY
  // IMPORTANT:
  // Convert API values to NUMBER
  // =====================================================

  get totalCapacity(): number {

    let total = 0;

    for (const room of this.occupancyData) {

      total += this.toNumber(room.capacity);
    }

    return total;
  }


  // =====================================================
  // TOTAL OCCUPIED
  // =====================================================

  get totalOccupiedBeds(): number {

    let total = 0;

    for (const room of this.occupancyData) {

      total += this.toNumber(
        room.occupied_beds
      );
    }

    return total;
  }


  // =====================================================
  // TOTAL AVAILABLE
  // =====================================================

  get totalAvailableBeds(): number {

    let total = 0;

    for (const room of this.occupancyData) {

      total += this.toNumber(
        room.available_beds
      );
    }

    return total;
  }


  // =====================================================
  // OCCUPANCY %
  // =====================================================

  get occupancyPercentage(): number {

    if (this.totalCapacity <= 0) {
      return 0;
    }

    return Number(
      (
        this.totalOccupiedBeds /
        this.totalCapacity *
        100
      ).toFixed(1)
    );
  }


  // =====================================================
  // UNIQUE PENDING STUDENTS
  // =====================================================

  get uniquePendingStudents(): number {

    const studentIds = new Set<number>();

    for (const row of this.pendingData) {

      studentIds.add(
        this.toNumber(row.student_id)
      );
    }

    return studentIds.size;
  }


  // =====================================================
  // TOTAL COLLECTION
  // =====================================================

  get totalCollection(): number {

    let total = 0;

    for (const row of this.collectionData) {

      total += this.toNumber(row.amount);
    }

    return total;
  }


  // =====================================================
  // TOTAL PENDING
  // =====================================================

  get totalPending(): number {

    let total = 0;

    for (const row of this.pendingData) {

      total += this.toNumber(
        row.pending_amount
      );
    }

    return total;
  }


  // =====================================================
  // TOTAL PAYMENTS
  // =====================================================

  get totalPayments(): number {

    let total = 0;

    for (const row of this.paymentData) {

      total += this.toNumber(row.amount);
    }

    return total;
  }


  // =====================================================
  // NUMBER CONVERSION
  // =====================================================

  toNumber(
    value: number | string | null | undefined
  ): number {

    const numberValue = Number(value);

    if (
      numberValue === null ||
      !Number.isFinite(numberValue)
    ) {
      return 0;
    }

    return numberValue;
  }


  // =====================================================
  // FORMAT MONTH
  // =====================================================

  formatMonth(
    value: string | null | undefined
  ): string {

    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        month: 'short',
        year: 'numeric'
      }
    );
  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    value: string | null | undefined
  ): string {

    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
  }


  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  formatAmount(
    value: number | string | null | undefined
  ): string {

    return this.toNumber(value)
      .toLocaleString(
        'en-IN',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      );
  }


  // =====================================================
  // ROOM STATUS CLASS
  // =====================================================

  getRoomStatusClass(
    status: string | null | undefined
  ): string {

    if (!status) {
      return '';
    }

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }


  // =====================================================
  // PAYMENT MODE CLASS
  // =====================================================

  getPaymentModeClass(
    mode: string | null | undefined
  ): string {

    if (!mode) {
      return '';
    }

    return mode
      .toLowerCase()
      .replace(/\s+/g, '-');
  }


  // =====================================================
  // FEE STATUS CLASS
  // =====================================================

  getFeeStatusClass(
    status: string | null | undefined
  ): string {

    if (!status) {
      return '';
    }

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

}