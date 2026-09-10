import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AllocationService } from '../../../core/services/allocation.service';

import {
  Allocation,
  AvailableBed,
  CreateAllocationRequest
} from '../../../core/models/allocation.model';
import { StudentService } from '../../../core/services/students.service';

interface Student {
  student_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  status: string;
}

interface StudentResponse {
  success: boolean;
  data: Student[];
}

@Component({
  selector: 'app-allocation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './allocation.html',
  styleUrl: './allocation.scss'
})
export class Allocations implements OnInit {

  /* =========================
     DATA
  ========================= */

  allocations: Allocation[] = [];
  students: Student[] = [];
  availableBeds: AvailableBed[] = [];

  /* =========================
     FORM
  ========================= */

  selectedStudentId: number | null = null;
  selectedBedId: number | null = null;
  allocationDate = this.getToday();
  remarks = '';

  /* =========================
     UI STATE
  ========================= */

  loading = false;
  saving = false;

  studentsLoading = false;
  bedsLoading = false;

  errorMessage = '';
  successMessage = '';

  searchText = '';

  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private allocationService: AllocationService,
    private studentService: StudentService

  ) { }

  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadStudents();
    this.loadAvailableBeds();
    this.loadAllocations();
  }

  

  /* =========================
     LOAD STUDENTS
  ========================= */

  loadStudents(): void {

    this.studentsLoading = true;
    this.errorMessage = '';

    this.studentService
      .getStudents()
      .subscribe({

        next: (response: { success: any; data: any; }) => {

          console.log(
            'Students API response:',
            response
          );

          if (response.success) {

            this.students =
              (response.data || [])
                .filter(
                  (student: { status: string; }) =>
                    student.status === 'ACTIVE'
                );

            console.log(
              'Active students:',
              this.students
            );

          } else {

            this.students = [];

            this.errorMessage =
              'Failed to load students';

          }

          this.studentsLoading = false;

        },

        error: (error: { error: { message: any; }; message: any; }) => {

          console.error(
            'Students API error:',
            error
          );

          this.students = [];

          this.studentsLoading = false;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to connect to students API';

        }

      });

  }
  /* =========================
     LOAD AVAILABLE BEDS
  ========================= */
  loadAvailableBeds(): void {

    this.bedsLoading = true;

    this.allocationService
      .getAvailableBeds()
      .subscribe({

        next: response => {

          console.log(
            'Available beds API response:',
            response
          );

          if (response.success) {

            this.availableBeds =
              response.data || [];

          } else {

            this.availableBeds = [];

            this.errorMessage =
              'Failed to load available beds';

          }

          this.bedsLoading = false;

        },

        error: error => {

          console.error(
            'Available beds API error:',
            error
          );

          this.availableBeds = [];

          this.bedsLoading = false;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load available beds';

        }

      });

  }

  /* =========================
     LOAD ACTIVE ALLOCATIONS
  ========================= */

  loadAllocations(): void {

    this.loading = true;

    this.allocationService
      .getActiveAllocations()
      .subscribe({

        next: response => {

          if (response.success) {

            this.allocations =
              response.data || [];

          } else {

            this.allocations = [];

          }

          this.loading = false;

        },

        error: error => {

          console.error(
            'Allocations API error:',
            error
          );

          this.allocations = [];

          this.errorMessage =
            error?.error?.message ||
            'Unable to load allocations';

          this.loading = false;

        }

      });

  }

  /* =========================
     CREATE ALLOCATION
  ========================= */

  allocateStudent(): void {

    this.clearMessages();

    if (!this.selectedStudentId) {

      this.errorMessage =
        'Please select a student';

      return;

    }

    if (!this.selectedBedId) {

      this.errorMessage =
        'Please select a room and bed';

      return;

    }

    if (!this.allocationDate) {

      this.errorMessage =
        'Please select allocation date';

      return;

    }

    const request: CreateAllocationRequest = {

      student_id: Number(
        this.selectedStudentId
      ),

      bed_id: Number(
        this.selectedBedId
      ),

      allocation_date:
        this.allocationDate,

      remarks:
        this.remarks?.trim() || undefined

    };

    console.log(
      'Creating allocation:',
      request
    );

    this.saving = true;

    this.allocationService
      .createAllocation(request)
      .subscribe({

        next: response => {

          console.log(
            'Allocation created:',
            response
          );

          this.successMessage =
            'Student allocated successfully';

          this.resetForm();

          /*
           * Refresh both:
           * 1. available beds
           * 2. active allocations
           */

          this.loadAvailableBeds();
          this.loadAllocations();

          this.saving = false;

        },

        error: error => {

          console.error(
            'Create allocation error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to allocate student';

          this.saving = false;

        }

      });

  }

  /* =========================
     VACATE STUDENT
  ========================= */

  vacateAllocation(
    allocation: Allocation
  ): void {

    const confirmed =
      window.confirm(
        `Are you sure you want to vacate ${allocation.student_name} from Room ${allocation.room_number}?`
      );

    if (!confirmed) {
      return;
    }

    this.clearMessages();

    this.allocationService
      .vacateAllocation(
        allocation.allocation_id
      )
      .subscribe({

        next: response => {

          console.log(
            'Vacated:',
            response
          );

          this.successMessage =
            'Student vacated successfully';

          this.loadAllocations();
          this.loadAvailableBeds();

        },

        error: error => {

          console.error(
            'Vacate error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to vacate student';

        }

      });

  }

  /* =========================
     RESET FORM
  ========================= */

  resetForm(): void {

    this.selectedStudentId = null;
    this.selectedBedId = null;

    this.allocationDate =
      this.getToday();

    this.remarks = '';

  }

  /* =========================
     REFRESH
  ========================= */

  refresh(): void {

    this.clearMessages();

    this.loadStudents();
    this.loadAvailableBeds();
    this.loadAllocations();

  }

  /* =========================
     FILTER
  ========================= */

  get filteredAllocations(): Allocation[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    if (!search) {
      return this.allocations;
    }

    return this.allocations.filter(
      allocation =>

        allocation.student_code
          ?.toLowerCase()
          .includes(search)

        ||

        allocation.student_name
          ?.toLowerCase()
          .includes(search)

        ||

        allocation.room_number
          ?.toLowerCase()
          .includes(search)

        ||

        allocation.bed_label
          ?.toLowerCase()
          .includes(search)

    );

  }

  /* =========================
     FORM HELPERS
  ========================= */

  getSelectedBed(): AvailableBed | undefined {

    if (!this.selectedBedId) {
      return undefined;
    }

    return this.availableBeds.find(
      bed =>
        bed.bed_id ===
        Number(this.selectedBedId)
    );

  }

  getSelectedStudent(): Student | undefined {

    if (!this.selectedStudentId) {
      return undefined;
    }

    return this.students.find(
      student =>
        student.student_id ===
        Number(this.selectedStudentId)
    );

  }

  /* =========================
     SUMMARY
  ========================= */

  get totalAllocations(): number {
    return this.allocations.length;
  }

  get totalAvailableBeds(): number {
    return this.availableBeds.length;
  }

  /* =========================
     MESSAGE HELPERS
  ========================= */

  clearMessages(): void {

    this.errorMessage = '';
    this.successMessage = '';

  }

  /* =========================
     DATE
  ========================= */

  private getToday(): string {

    const date =
      new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

}