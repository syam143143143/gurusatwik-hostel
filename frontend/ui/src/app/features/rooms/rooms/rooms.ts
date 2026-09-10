import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../core/services/room.service';
import { Room, RoomResponse } from '../../../core/models/room.model';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './rooms.html',
  styleUrl: './rooms.scss'
})
export class Rooms implements OnInit {

  rooms: Room[] = [];
  filteredRooms: Room[] = [];

  loading = false;
  errorMessage = '';

  selectedFloor = 'ALL';
  selectedSharing = 'ALL';
  searchText = '';

  constructor(
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {

    this.loading = true;
    this.errorMessage = '';

    this.roomService.getRooms().subscribe({
      
      next: (response: RoomResponse) => {

        console.log('Rooms response:', response);

        if (response.success) {

          this.rooms = response.data || [];
          this.filteredRooms = [...this.rooms];

        } else {

          this.rooms = [];
          this.filteredRooms = [];

          this.errorMessage = 'Failed to load rooms';
        }

        this.loading = false;
      },

      error: (error) => {

        console.error('Rooms API error:', error);

        this.rooms = [];
        this.filteredRooms = [];

        this.errorMessage =
          error?.error?.message ||
          'Unable to connect to server';

        this.loading = false;
      }
    });
  }

  filterRooms(): void {

    const search = this.searchText
      .trim()
      .toLowerCase();

    this.filteredRooms = this.rooms.filter((room: Room) => {

      const floorMatch =
        this.selectedFloor === 'ALL' ||
        room.floor_number.toString() === this.selectedFloor;

      const sharingMatch =
        this.selectedSharing === 'ALL' ||
        room.sharing_name === this.selectedSharing;

      const searchMatch =
        !search ||
        room.room_number.toLowerCase().includes(search) ||
        room.sharing_name.toLowerCase().includes(search);

      return floorMatch &&
             sharingMatch &&
             searchMatch;
    });
  }

  onFloorChange(event: Event): void {

    this.selectedFloor =
      (event.target as HTMLSelectElement).value;

    this.filterRooms();
  }

  onSharingChange(event: Event): void {

    this.selectedSharing =
      (event.target as HTMLSelectElement).value;

    this.filterRooms();
  }

  onSearch(event: Event): void {

    this.searchText =
      (event.target as HTMLInputElement).value;

    this.filterRooms();
  }

  refresh(): void {

    this.selectedFloor = 'ALL';
    this.selectedSharing = 'ALL';
    this.searchText = '';

    this.loadRooms();
  }

  get totalRooms(): number {
    return this.rooms.length;
  }

  get totalBeds(): number {
    return this.rooms.reduce(
      (total, room) =>
        total + Number(room.capacity || 0),
      0
    );
  }

  get occupiedBeds(): number {
    return this.rooms.reduce(
      (total, room) =>
        total + Number(room.occupied_beds || 0),
      0
    );
  }

  get availableBeds(): number {
    return this.rooms.reduce(
      (total, room) =>
        total + Number(room.available_beds || 0),
      0
    );
  }

  getRoomStatusClass(status: string): string {

    switch (status) {

      case 'FULL':
        return 'status-full';

      case 'PARTIAL':
        return 'status-partial';

      case 'AVAILABLE':
        return 'status-available';

      default:
        return 'status-default';
    }
  }
}