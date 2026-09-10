import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentService } from '../../../core/services/payment.service';

import {
  PendingFee,
  Payment,
  CreatePaymentRequest
} from '../../../core/models/payment.model';
import { FeeService } from '../../../core/services/fee.service';
import { StudentService } from '../../../core/services/students.service';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments implements OnInit {

  students: Student[] = [];

  pendingFees: PendingFee[] = [];

  payments: Payment[] = [];

  selectedStudentId: number | null = null;

  paymentAmount: number | null = null;

  paymentMode:
    | 'CASH'
    | 'UPI'
    | 'BANK'
    | 'CARD'
    | 'OTHER' = 'CASH';

  referenceNumber = '';

  remarks = '';

  paymentDate = '';

  loadingStudents = false;

  loadingFees = false;

  loadingPayments = false;

  saving = false;

  successMessage = '';

  errorMessage = '';

  constructor(
    private paymentService: PaymentService,
    private studentService: StudentService,
    private route: ActivatedRoute,
      private feeService: FeeService,

    private router: Router
  ) {}

  ngOnInit(): void {

    this.paymentDate = this.getToday();

    this.loadStudents();

    this.loadPayments();

    this.route.queryParams.subscribe(params => {

      const studentId =
        Number(params['studentId']);

      if (studentId) {

        this.selectedStudentId =
          studentId;

        this.loadStudentPendingFees(
          studentId
        );

      }

    });

  }
loadStudents(): void {
  this.loadingStudents = true;

  this.studentService.getStudents().subscribe({
    next: (response) => {
      if (response.success) {
        this.students = response.data || [];
      }

      this.loadingStudents = false;
    },

    error: (error) => {
      console.error('Students error:', error);

      this.loadingStudents = false;
      this.errorMessage = 'Unable to load students.';
    }
  });
}

  onStudentChange(): void {

    this.successMessage = '';

    this.errorMessage = '';

    this.paymentAmount = null;

    this.referenceNumber = '';

    this.remarks = '';

    if (!this.selectedStudentId) {

      this.pendingFees = [];

      return;

    }

    this.loadStudentPendingFees(
      this.selectedStudentId
    );

  }

loadStudentPendingFees(studentId: number): void {

  this.loadingFees = true;

  this.feeService
    .getStudentFees(studentId)
    .subscribe({

      next: response => {

        if (response.success) {

          this.pendingFees =
            (response.data || [])
              .filter(
                fee =>
                  Number(fee.pending_amount || 0) > 0
              )
              .map(fee => ({
                student_fee_id:
                  fee.student_fee_id,

                fee_month:
                  fee.fee_month,

                total_amount:
                  Number(fee.total_amount || 0),

                paid_amount:
                  Number(fee.paid_amount || 0),

                pending_amount:
                  Number(fee.pending_amount || 0),

                status:
                  fee.status,

                due_date:
                  fee.due_date
              }));

        } else {

          this.pendingFees = [];

        }

        this.loadingFees = false;

      },

      error: (error: { error: { message: string; }; }) => {

        console.error(
          'Pending fees error:',
          error
        );

        this.pendingFees = [];

        this.loadingFees = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to load pending fees.';

      }

    });

}

  loadPayments(): void {

    this.loadingPayments = true;

    this.paymentService.getPayments().subscribe({

      next: response => {

        if (response.success) {

          this.payments =
            response.data || [];

        }

        this.loadingPayments = false;

      },

      error: error => {

        console.error(
          'Payments error:',
          error
        );

        this.loadingPayments = false;

      }

    });

  }

  get selectedStudent(): Student | undefined {

    return this.students.find(
      student =>
        student.student_id ===
        this.selectedStudentId
    );

  }

  get totalPending(): number {

    return this.pendingFees.reduce(
      (total, fee) =>
        total +
        Number(fee.pending_amount || 0),
      0
    );

  }

  get totalPaidForStudent(): number {

    return this.pendingFees.reduce(
      (total, fee) =>
        total +
        Number(fee.paid_amount || 0),
      0
    );

  }

  get validPaymentAmount(): boolean {

    const amount =
      Number(this.paymentAmount || 0);

    return (
      amount > 0 &&
      amount <= this.totalPending
    );

  }

  collectPayment(): void {

    this.successMessage = '';

    this.errorMessage = '';

    if (!this.selectedStudentId) {

      this.errorMessage =
        'Please select a student.';

      return;

    }

    const amount =
      Number(this.paymentAmount || 0);

    if (amount <= 0) {

      this.errorMessage =
        'Please enter a valid payment amount.';

      return;

    }

    if (amount > this.totalPending) {

      this.errorMessage =
        `Payment amount cannot exceed pending amount of ₹${this.totalPending.toFixed(2)}.`;

      return;

    }

    if (
      (this.paymentMode === 'UPI' ||
       this.paymentMode === 'BANK' ||
       this.paymentMode === 'CARD') &&
      !this.referenceNumber.trim()
    ) {

      this.errorMessage =
        'Reference number is required for this payment mode.';

      return;

    }

    const payload: CreatePaymentRequest = {

      student_id:
        this.selectedStudentId,

      amount,

      payment_mode:
        this.paymentMode,

      reference_number:
        this.referenceNumber.trim() || undefined,

      remarks:
        this.remarks.trim() || undefined

    };

    this.saving = true;

    this.paymentService
      .createPayment(payload)
      .subscribe({

        next: response => {

          this.saving = false;

          if (response.success) {

            this.successMessage =
              response.message ||
              'Payment collected successfully.';

            this.paymentAmount = null;

            this.referenceNumber = '';

            this.remarks = '';

            this.loadPayments();

            this.loadStudentPendingFees(
              this.selectedStudentId!
            );

          } else {

            this.errorMessage =
              response.message ||
              'Payment failed.';

          }

        },

        error: error => {

          console.error(
            'Payment error:',
            error
          );

          this.saving = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to process payment.';

        }

      });

  }

  setFullPendingAmount(): void {

    this.paymentAmount =
      this.totalPending;

  }

  clearForm(): void {

    this.paymentAmount = null;

    this.paymentMode = 'CASH';

    this.referenceNumber = '';

    this.remarks = '';

    this.successMessage = '';

    this.errorMessage = '';

  }

  goBack(): void {

    this.router.navigate(
      ['/fees']
    );

  }

  getToday(): string {

    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        today.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

}