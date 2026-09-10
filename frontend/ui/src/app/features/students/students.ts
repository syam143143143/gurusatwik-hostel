import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Student } from '../../core/models/student.model';
import { StudentService } from '../../core/services/students.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './students.html',
  styleUrl: './students.scss'
})
export class Students implements OnInit {

  students: Student[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  // Student form dialog
  showForm = false;

  // Submit confirmation dialog
  showConfirmDialog = false;

  editMode = false;
  selectedStudentId: number | null = null;

  searchText = '';

  student: any = {
    student_code: '',
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    mobile_number: '',
    alternate_mobile: '',
    email: '',
    college_name: '',
    course_name: '',
    academic_year: '',
    guardian_name: '',
    guardian_mobile: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    joining_date: '',
    leaving_date: '',
    status: 'ACTIVE'
  };

  constructor(
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  // =========================================================
  // LOAD STUDENTS
  // =========================================================

  loadStudents(): void {

    this.loading = true;
    this.errorMessage = '';

    this.studentService.getStudents().subscribe({

      next: (response) => {

        if (response.success) {

          this.students = response.data || [];

        } else {

          this.errorMessage =
            'Failed to load students';
        }

        this.loading = false;
      },

      error: (error) => {

        console.error('Students API error:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to load students';

        this.loading = false;
      }

    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  get filteredStudents(): Student[] {

    const search = this.searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return this.students;
    }

    return this.students.filter(student =>

      `${student.first_name} ${student.last_name || ''}`
        .toLowerCase()
        .includes(search) ||

      student.student_code
        ?.toLowerCase()
        .includes(search) ||

      student.mobile_number
        ?.toLowerCase()
        .includes(search) ||

      student.college_name
        ?.toLowerCase()
        .includes(search)

    );
  }

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  openAddForm(): void {

    this.editMode = false;
    this.selectedStudentId = null;

    this.resetForm();

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;
  }

  // =========================================================
  // EDIT STUDENT
  // =========================================================

  editStudent(student: Student): void {

    this.editMode = true;

    this.selectedStudentId =
      student.student_id;

    this.student = {

      student_code:
        student.student_code || '',

      first_name:
        student.first_name || '',

      last_name:
        student.last_name || '',

      gender:
        student.gender || '',

      date_of_birth:
        student.date_of_birth || '',

      mobile_number:
        student.mobile_number || '',

      alternate_mobile:
        student.alternate_mobile || '',

      email:
        student.email || '',

      college_name:
        student.college_name || '',

      course_name:
        student.course_name || '',

      academic_year:
        student.academic_year || '',

      guardian_name:
        student.guardian_name || '',

      guardian_mobile:
        student.guardian_mobile || '',

      address:
        student.address || '',

      emergency_contact_name:
        student.emergency_contact_name || '',

      emergency_contact_number:
        student.emergency_contact_number || '',

      joining_date:
        student.joining_date || '',

      leaving_date:
        student.leaving_date || '',

      status:
        student.status || 'ACTIVE'
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;
  }

  // =========================================================
  // CLOSE FORM
  // =========================================================

  closeForm(): void {

    if (this.saving) {
      return;
    }

    this.showForm = false;

    this.showConfirmDialog = false;

    this.resetForm();
  }

  // =========================================================
  // SUBMIT BUTTON
  // =========================================================
  // This ONLY opens confirmation dialog.
  // API is NOT called here.
  // =========================================================

  saveStudent(): void {

    this.errorMessage = '';

    // Validation
    if (!this.student.first_name?.trim()) {

      this.errorMessage =
        'First name is required';

      return;
    }

    if (!this.student.mobile_number?.trim()) {

      this.errorMessage =
        'Mobile number is required';

      return;
    }

    if (!this.student.joining_date) {

      this.errorMessage =
        'Joining date is required';

      return;
    }

    // Open confirmation dialog
    this.showConfirmDialog = true;
  }

  // =========================================================
  // CANCEL CONFIRMATION
  // =========================================================

  cancelSubmit(): void {

    this.showConfirmDialog = false;
  }

  // =========================================================
  // CONFIRM SUBMIT
  // =========================================================

  confirmSubmit(): void {

    // Close confirmation dialog immediately
    this.showConfirmDialog = false;

    this.saving = true;

    this.errorMessage = '';
    this.successMessage = '';

    // =======================================================
    // UPDATE
    // =======================================================

    if (
      this.editMode &&
      this.selectedStudentId
    ) {

      this.studentService
        .updateStudent(
          this.selectedStudentId,
          this.student
        )
        .subscribe({

          next: (response: { success: any; }) => {

            if (response.success) {

              // API successful
              this.successMessage =
                'Student updated successfully';

              // Close form dialog
              this.showForm = false;

              // Reset form
              this.resetForm();

              // Refresh table
              this.loadStudents();

            } else {

              this.errorMessage =
                'Failed to update student';
            }

            this.saving = false;
          },

          error: (error: { error: { message: string; }; }) => {

            console.error(
              'Update student error:',
              error
            );

            this.errorMessage =
              error?.error?.message ||
              'Failed to update student';

            this.saving = false;
          }

        });

      return;
    }

    // =======================================================
    // CREATE
    // =======================================================

    this.studentService
      .createStudent(this.student)
      .subscribe({

        next: (response: { success: any; }) => {

          if (response.success) {

            // API successful
            this.successMessage =
              'Student added successfully';

            // Close student form
            this.showForm = false;

            // Reset form
            this.resetForm();

            // Refresh table
            this.loadStudents();

          } else {

            this.errorMessage =
              'Failed to add student';
          }

          this.saving = false;
        },

        error: (error: { error: { message: string; }; }) => {

          console.error(
            'Create student error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to add student';

          this.saving = false;
        }

      });
  }

  // =========================================================
  // DELETE / DEACTIVATE
  // =========================================================

  deleteStudent(student: Student): void {

    const confirmed = confirm(
      `Are you sure you want to deactivate ${this.getFullName(student)}?`
    );

    if (!confirmed) {
      return;
    }

    this.studentService
      .deleteStudent(student.student_id)
      .subscribe({

        next: () => {

          this.successMessage =
            'Student deactivated successfully';

          // Refresh table
          this.loadStudents();
        },

        error: (error: { error: { message: string; }; }) => {

          console.error(
            'Delete student error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to deactivate student';
        }

      });
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  resetForm(): void {

    this.student = {

      student_code: '',

      first_name: '',

      last_name: '',

      gender: '',

      date_of_birth: '',

      mobile_number: '',

      alternate_mobile: '',

      email: '',

      college_name: '',

      course_name: '',

      academic_year: '',

      guardian_name: '',

      guardian_mobile: '',

      address: '',

      emergency_contact_name: '',

      emergency_contact_number: '',

      joining_date: '',

      leaving_date: '',

      status: 'ACTIVE'
    };

    this.selectedStudentId = null;
  }

  // =========================================================
  // FULL NAME
  // =========================================================

  getFullName(student: Student): string {

    return `${student.first_name} ${
      student.last_name || ''
    }`.trim();
  }
}