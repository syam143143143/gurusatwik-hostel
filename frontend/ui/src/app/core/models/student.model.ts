export interface Student {
  student_id: number;
  student_code: string;
  first_name: string;
  last_name: string | null;
  gender: string;
  date_of_birth: string | null;
  mobile_number: string;
  alternate_mobile: string | null;
  email: string | null;
  college_name: string;
  course_name: string | null;
  academic_year: string | null;
  guardian_name: string | null;
  guardian_mobile: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
  joining_date: string;
  leaving_date: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentResponse {
  success: boolean;
  data: Student[];
}

export interface SingleStudentResponse {
  success: boolean;
  data: Student;
}