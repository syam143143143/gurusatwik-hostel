import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from './api.config';

import {
  PaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly apiUrl =
    `${API_CONFIG.baseUrl}/payments`;

  constructor(
    private http: HttpClient
  ) {}

  getPayments(): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(
      this.apiUrl
    );
  }

  getStudentPayments(
    studentId: number
  ): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(
      `${this.apiUrl}/student/${studentId}`
    );
  }

  getPaymentAllocations(
    paymentId: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${paymentId}/allocations`
    );
  }

  createPayment(
    data: CreatePaymentRequest
  ): Observable<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>(
      this.apiUrl,
      data
    );
  }
}