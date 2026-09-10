export interface DashboardData {
  total_students: number;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  current_month_fee: number;
  current_month_collection: number;
  total_pending_fees: number;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}