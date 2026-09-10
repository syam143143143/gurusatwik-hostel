import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from './api.config';

import {
  AllocationResponse,
  AvailableBedsResponse,
  CreateAllocationRequest,
  AllocationSingleResponse
} from '../models/allocation.model';


@Injectable({
  providedIn: 'root'
})
export class AllocationService {

  private readonly apiUrl =
    `${API_CONFIG.baseUrl}/allocations`;


  constructor(
    private http: HttpClient
  ) {}


  getAllocations():
    Observable<AllocationResponse> {

    return this.http.get<AllocationResponse>(
      this.apiUrl
    );

  }


  getActiveAllocations():
    Observable<AllocationResponse> {

    return this.http.get<AllocationResponse>(
      `${this.apiUrl}/active`
    );

  }


  getAvailableBeds():
    Observable<AvailableBedsResponse> {

    return this.http.get<AvailableBedsResponse>(
      `${this.apiUrl}/available-beds`
    );

  }


  getAllocation(
    id: number
  ): Observable<AllocationSingleResponse> {

    return this.http.get<AllocationSingleResponse>(
      `${this.apiUrl}/${id}`
    );

  }


  createAllocation(
    data: CreateAllocationRequest
  ): Observable<AllocationSingleResponse> {

    return this.http.post<AllocationSingleResponse>(
      this.apiUrl,
      data
    );

  }


  vacateAllocation(
    id: number
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}/vacate`,
      {}
    );

  }

}