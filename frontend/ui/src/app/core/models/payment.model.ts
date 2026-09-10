export interface PendingFee {
  student_fee_id: number;
  fee_month: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: string;
  due_date: string;
}

export interface Payment {
  payment_id: number;
  student_id: number;
  student_code: string;
  student_name: string;
  payment_date: string;
  amount: number;
  payment_mode: string;
  reference_number: string | null;
  receipt_number: string | null;
  remarks: string | null;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment[];
}

export interface CreatePaymentRequest {
  student_id: number;
  amount: number;
  payment_mode: 'CASH' | 'UPI' | 'BANK' | 'CARD' | 'OTHER';
  reference_number?: string;
  remarks?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: number;
  };
}