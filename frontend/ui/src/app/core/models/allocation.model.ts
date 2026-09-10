export interface Allocation {
  allocation_id: number;
  student_id: number;

  student_code: string;
  student_name: string;

  bed_id: number;
  bed_number: number;
  bed_label: string;

  room_id: number;
  room_number: string;

  floor_number: number;
  sharing_name: string;

  monthly_fee: number;

  allocation_date: string;
  vacated_date: string | null;

  status: string;
  remarks: string | null;
}


export interface AvailableBed {
  bed_id: number;
  bed_number: number;
  bed_label: string;

  room_id: number;
  room_number: string;

  floor_number: number;

  sharing_name: string;

  monthly_fee: number;
}


export interface AllocationResponse {
  success: boolean;
  data: Allocation[];
}


export interface AvailableBedsResponse {
  success: boolean;
  data: AvailableBed[];
}


export interface AllocationSingleResponse {
  success: boolean;
  data: Allocation;
}


export interface CreateAllocationRequest {
  student_id: number;
  bed_id: number;
  allocation_date: string;
  remarks?: string;
}