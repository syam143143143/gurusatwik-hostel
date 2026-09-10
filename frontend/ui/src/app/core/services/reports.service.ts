import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from './api.config';

import {
  OccupancyReport,
  CollectionReport,
  PendingFeeReport,
  PaymentReport,
  ReportResponse
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private readonly apiUrl = `${API_CONFIG.baseUrl}/reports`;

  constructor(
    private http: HttpClient
  ) {}

  getOccupancyReport(): Observable<ReportResponse<OccupancyReport>> {
    return this.http.get<ReportResponse<OccupancyReport>>(
      `${this.apiUrl}/occupancy`
    );
  }

  getMonthlyCollectionReport(
    fromDate?: string,
    toDate?: string
  ): Observable<ReportResponse<CollectionReport>> {

    let params = new HttpParams();

    if (fromDate) {
      params = params.set('from_date', fromDate);
    }

    if (toDate) {
      params = params.set('to_date', toDate);
    }

    return this.http.get<ReportResponse<CollectionReport>>(
      `${this.apiUrl}/monthly-collection`,
      { params }
    );
  }

  getPendingFeesReport(): Observable<ReportResponse<PendingFeeReport>> {
    return this.http.get<ReportResponse<PendingFeeReport>>(
      `${this.apiUrl}/pending-fees`
    );
  }

  getStudentLedger(
    studentId: number
  ): Observable<ReportResponse<PendingFeeReport>> {

    return this.http.get<ReportResponse<PendingFeeReport>>(
      `${this.apiUrl}/student-ledger/${studentId}`
    );
  }

  getPaymentReport(
    fromDate?: string,
    toDate?: string,
    paymentMode?: string
  ): Observable<ReportResponse<PaymentReport>> {

    let params = new HttpParams();

    if (fromDate) {
      params = params.set('from_date', fromDate);
    }

    if (toDate) {
      params = params.set('to_date', toDate);
    }

    if (paymentMode && paymentMode !== 'ALL') {
      params = params.set('payment_mode', paymentMode);
    }

    return this.http.get<ReportResponse<PaymentReport>>(
      `${this.apiUrl}/payments`,
      { params }
    );
  }
}