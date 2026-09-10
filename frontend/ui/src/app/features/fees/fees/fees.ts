import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FeeService } from '../../../core/services/fee.service';
import { FeeResponse, GenerateFeeResponse, StudentFee } from '../../../core/models/fees.model';


@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './fees.html',
  styleUrl: './fees.scss'
})
export class Fees implements OnInit {

  // ============================================================
  // DATA
  // ============================================================

  fees: StudentFee[] = [];
  filteredFees: StudentFee[] = [];

  // ============================================================
  // LOADING
  // ============================================================

  loading = false;
  generating = false;

  // ============================================================
  // MESSAGES
  // ============================================================

  successMessage = '';
  errorMessage = '';

  // ============================================================
  // FILTERS
  // ============================================================

  searchText = '';

  selectedStatus = 'ALL';

  selectedMonth = '';

  // ============================================================
  // MONTH GENERATION
  // ============================================================

  feeMonth = '';

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private feeService: FeeService,
    private router: Router
  ) {}

  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.feeMonth = this.getCurrentMonth();

    this.loadFees();

  }

  // ============================================================
  // LOAD FEES
  // ============================================================

  loadFees(): void {

    this.loading = true;

    this.errorMessage = '';

    this.feeService.getFees().subscribe({

      next: (response: FeeResponse) => {

        console.log('Fees response:', response);

        if (response.success) {

          this.fees = response.data || [];

          this.applyFilters();

        } else {

          this.fees = [];

          this.filteredFees = [];

          this.errorMessage = 'Failed to load fee records.';

        }

        this.loading = false;

      },

      error: (error) => {

        console.error('Fees API error:', error);

        this.fees = [];

        this.filteredFees = [];

        this.errorMessage =
          error?.error?.message ||
          'Unable to connect to server.';

        this.loading = false;

      }

    });

  }

  // ============================================================
  // GENERATE MONTHLY FEES
  // ============================================================

  generateMonthlyFees(): void {

    if (!this.feeMonth) {

      this.errorMessage = 'Please select a fee month.';

      return;

    }

    this.generating = true;

    this.successMessage = '';

    this.errorMessage = '';

    /*
     * Convert YYYY-MM to YYYY-MM-01.
     *
     * Database function expects a DATE.
     */

    const feeMonthDate = `${this.feeMonth}-01`;

    this.feeService.generateFees(feeMonthDate).subscribe({

      next: (response: GenerateFeeResponse) => {

        console.log('Generate fees response:', response);

        this.generating = false;

        if (response.success) {

          const count =
            response.data?.generated_count ?? 0;

          this.successMessage =
            count > 0
              ? `${count} monthly fee record(s) generated successfully.`
              : 'No new fee records were generated. Fees may already exist for this month.';

          this.loadFees();

        } else {

          this.errorMessage =
            response.message ||
            'Unable to generate monthly fees.';

        }

      },

      error: (error) => {

        console.error('Generate fees error:', error);

        this.generating = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to generate monthly fees.';

      }

    });

  }

  // ============================================================
  // FILTERS
  // ============================================================

  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    this.filteredFees = this.fees.filter(
      (fee: StudentFee) => {

        // ----------------------------------------
        // SEARCH
        // ----------------------------------------

        const searchMatch =
          !search ||
          (fee.student_code || '')
            .toLowerCase()
            .includes(search) ||
          (fee.student_name || '')
            .toLowerCase()
            .includes(search);

        // ----------------------------------------
        // STATUS
        // ----------------------------------------

        const statusMatch =
          this.selectedStatus === 'ALL' ||
          fee.status === this.selectedStatus;

        // ----------------------------------------
        // MONTH
        // ----------------------------------------

        const monthMatch =
          !this.selectedMonth ||
          this.getMonthValue(fee.fee_month) ===
            this.selectedMonth;

        return (
          searchMatch &&
          statusMatch &&
          monthMatch
        );

      }
    );

  }

  // ============================================================
  // SEARCH
  // ============================================================

  onSearch(event: Event): void {

    this.searchText =
      (event.target as HTMLInputElement).value;

    this.applyFilters();

  }

  // ============================================================
  // STATUS FILTER
  // ============================================================

  onStatusChange(event: Event): void {

    this.selectedStatus =
      (event.target as HTMLSelectElement).value;

    this.applyFilters();

  }

  // ============================================================
  // MONTH FILTER
  // ============================================================

  onMonthChange(event: Event): void {

    this.selectedMonth =
      (event.target as HTMLInputElement).value;

    this.applyFilters();

  }

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = 'ALL';

    this.selectedMonth = '';

    this.applyFilters();

  }

  // ============================================================
  // PAYMENT
  // ============================================================

  collectPayment(fee: StudentFee): void {

    this.router.navigate(
      ['/payments'],
      {
        queryParams: {
          studentId: fee.student_id
        }
      }
    );

  }

  // ============================================================
  // REFRESH
  // ============================================================

  refresh(): void {

    this.searchText = '';

    this.selectedStatus = 'ALL';

    this.selectedMonth = '';

    this.loadFees();

  }

  // ============================================================
  // SUMMARY
  // ============================================================

  get totalFee(): number {

    return this.fees.reduce(
      (total, fee) =>
        total + Number(fee.total_amount || 0),
      0
    );

  }

  get totalPaid(): number {

    return this.fees.reduce(
      (total, fee) =>
        total + Number(fee.paid_amount || 0),
      0
    );

  }

  get totalPending(): number {

    return this.fees.reduce(
      (total, fee) =>
        total + Number(fee.pending_amount || 0),
      0
    );

  }

  get totalStudents(): number {

    return new Set(
      this.fees.map(
        fee => fee.student_id
      )
    ).size;

  }

  get pendingStudents(): number {

    return new Set(
      this.fees
        .filter(
          fee =>
            Number(fee.pending_amount || 0) > 0
        )
        .map(
          fee => fee.student_id
        )
    ).size;

  }

  // ============================================================
  // STATUS COUNT
  // ============================================================

  get pendingCount(): number {

    return this.fees.filter(
      fee => fee.status === 'PENDING'
    ).length;

  }

  get partialCount(): number {

    return this.fees.filter(
      fee => fee.status === 'PARTIAL'
    ).length;

  }

  get paidCount(): number {

    return this.fees.filter(
      fee => fee.status === 'PAID'
    ).length;

  }

  // ============================================================
  // STATUS CLASS
  // ============================================================

  getStatusClass(status: string): string {

    switch (status) {

      case 'PAID':
        return 'status-paid';

      case 'PARTIAL':
        return 'status-partial';

      case 'PENDING':
        return 'status-pending';

      default:
        return 'status-default';

    }

  }

  // ============================================================
  // MONTH DISPLAY
  // ============================================================

  getMonthValue(date: string): string {

    if (!date) {
      return '';
    }

    return date.substring(0, 7);

  }

  // ============================================================
  // TODAY
  // ============================================================

  getCurrentMonth(): string {

    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0');

    return `${year}-${month}`;

  }

}