export interface StudentFee {

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

  status: 'PENDING' | 'PARTIAL' | 'PAID';

  remarks: string | null;

}


export interface FeeResponse {

  success: boolean;

  data: StudentFee[];

}


export interface GenerateFeeResponse {

  success: boolean;

  message: string;

  data: {

    generated_count: number;

  };

}