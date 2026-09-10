import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from './api.config';
import { FeeResponse, GenerateFeeResponse } from '../models/fees.model';


@Injectable({
  providedIn: 'root'
})
export class FeeService {

  private readonly apiUrl =
    `${API_CONFIG.baseUrl}/fees`;

  constructor(
    private http: HttpClient
  ) {}

  getFees(): Observable<FeeResponse> {

    return this.http.get<FeeResponse>(
      this.apiUrl
    );

  }

  getStudentFees(
    studentId: number
  ): Observable<FeeResponse> {

    return this.http.get<FeeResponse>(
      `${this.apiUrl}/student/${studentId}`
    );

  }

  getStudentPending(
    studentId: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/student/${studentId}/pending`
    );

  }

  generateFees(
    feeMonth: string
  ): Observable<GenerateFeeResponse> {

    return this.http.post<GenerateFeeResponse>(
      `${this.apiUrl}/generate`,
      {
        fee_month: feeMonth
      }
    );

  }

}