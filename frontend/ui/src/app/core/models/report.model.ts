export interface OccupancyReport {
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

export interface CollectionReport {
  payment_date: string;
  payment_id: number;
  student_id: number;
  student_code: string;
  student_name: string;
  amount: number;
  payment_mode: string;
  reference_number: string | null;
  receipt_number: string | null;
  remarks: string | null;
}

export interface PendingFeeReport {
  student_fee_id: number;
  student_id: number;
  student_code: string;
  student_name: string;
  fee_month: string;
  hostel_fee: number;
  mess_fee: number;
  electricity_fee: number;
  maintenance_fee: number;
  other_fee: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  due_date: string;
  status: string;
}

export interface PaymentReport {
  payment_id: number;
  payment_date: string;
  student_id: number;
  student_code: string;
  student_name: string;
  amount: number;
  payment_mode: string;
  reference_number: string | null;
  receipt_number: string | null;
  remarks: string | null;
}

export interface ReportResponse<T> {
  success: boolean;
  data: T[];
}