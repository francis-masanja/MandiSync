export interface Mandi {
  id: string;
  name: string;
  code: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  max_daily_kg: number;
  allocated_today_kg: number;
  active_queue_count: number;
  avg_wait_minutes: number;
}

export interface Slot {
  id: string;
  mandi_id: string;
  window_start: string;
  window_end: string;
  total_capacity_kg: number;
  booked_kg: number;
  is_available: boolean;
}

export interface Booking {
  id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  farmer_village: string;
  mandi_id: string;
  mandi_name: string;
  slot_id: string;
  slot_window: string;
  crop_type: string;
  crop_variety?: string;
  estimated_kg: number;
  actual_gross_kg?: number;
  actual_tare_kg?: number;
  actual_net_kg?: number;
  moisture_pct?: number;
  rate_per_quintal: number;
  total_payout_inr?: number;
  hmac_token: string;
  status: 'CONFIRMED' | 'GATE_VERIFIED' | 'WEIGHED_GROSS' | 'COMPLETED' | 'CANCELLED';
  vehicle_number: string;
  rfid_tag: string;
  distance_km: number;
  created_at: string;
  gate_entry_at?: string;
  gross_weighed_at?: string;
  tare_weighed_at?: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  device_id: string;
  sensor_type: 'RFID_UHF' | 'HX711_ADC' | 'ULTRASONIC' | 'SERVO_BARRIER' | 'LITTLEFS_BUFFER';
  action: string;
  raw_payload: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'OFFLINE_BUFFERED';
}
