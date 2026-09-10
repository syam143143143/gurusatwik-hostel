export interface Room {
  room_id: number;
  floor_number: number;
  room_number: string;
  sharing_name: string;
  capacity: number;
  occupied_beds: number;
  available_beds: number;
  usable_beds: number;
  monthly_fee: number;
  room_status: string;
}

export interface RoomResponse {
  success: boolean;
  data: Room[];
}