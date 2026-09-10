import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from './api.config';
import { Room, RoomResponse } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private readonly apiUrl = `${API_CONFIG.baseUrl}/rooms`;

  constructor(
    private http: HttpClient
  ) {}

  getRooms(): Observable<RoomResponse> {
    return this.http.get<RoomResponse>(this.apiUrl);
  }

  getRoom(roomId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${roomId}`);
  }

  getRoomBeds(roomId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${roomId}/beds`);
  }

  getAvailableBeds(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/available-beds`);
  }
}