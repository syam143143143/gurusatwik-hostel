import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from './api.config';
import {
  Student,
  StudentResponse,
  SingleStudentResponse
} from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly apiUrl = `${API_CONFIG.baseUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents(): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(this.apiUrl);
  }

  getStudent(id: number): Observable<SingleStudentResponse> {
    return this.http.get<SingleStudentResponse>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: Partial<Student>): Observable<SingleStudentResponse> {
    return this.http.post<SingleStudentResponse>(
      this.apiUrl,
      student
    );
  }

  updateStudent(
    id: number,
    student: Partial<Student>
  ): Observable<SingleStudentResponse> {
    return this.http.put<SingleStudentResponse>(
      `${this.apiUrl}/${id}`,
      student
    );
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}