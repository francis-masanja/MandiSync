import { Mandi, Slot, Booking, TelemetryLog } from './types';
import { calculateHaversineDistance } from './spatial';

const INITIAL_MANDIS: Mandi[] = [
  {
    id: 'mandi-01',
    name: 'Karnal Central APMC Mandi',
    code: 'HR-KRN-01',
    state: 'Haryana',
    district: 'Karnal',
    latitude: 29.6857,
    longitude: 76.9905,
    max_daily_kg: 10000,
    allocated_today_kg: 5500,
    active_queue_count: 3,
    avg_wait_minutes: 25,
  },
  {
    id: 'mandi-02',
    name: 'Khanna Grain Mega Market',
    code: 'PB-KHN-02',
    state: 'Punjab',
    district: 'Ludhiana',
    latitude: 30.7071,
    longitude: 76.2167,
    max_daily_kg: 15000,
    allocated_today_kg: 7200,
    active_queue_count: 5,
    avg_wait_minutes: 35,
  },
  {
    id: 'mandi-03',
    name: 'Kota Bhamashah Krishi Mandi',
    code: 'RJ-KTA-03',
    state: 'Rajasthan',
    district: 'Kota',
    latitude: 25.1843,
    longitude: 75.8427,
    max_daily_kg: 8000,
    allocated_today_kg: 4100,
    active_queue_count: 2,
    avg_wait_minutes: 20,
  },
  {
    id: 'mandi-04',
    name: 'Indore Laxmibai Nagar Mandi',
    code: 'MP-IND-04',
    state: 'Madhya Pradesh',
    district: 'Indore',
    latitude: 22.7533,
    longitude: 75.8937,
    max_daily_kg: 12000,
    allocated_today_kg: 6800,
    active_queue_count: 4,
    avg_wait_minutes: 30,
  },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-2026-001',
    farmer_id: 'FARM-8821',
    farmer_name: 'Harpreet Singh Sandhu',
    farmer_phone: '+91 98140 12345',
    farmer_village: 'Taraori Farm Cluster',
    mandi_id: 'mandi-01',
    mandi_name: 'Karnal Central APMC Mandi',
    slot_id: 'slot-01',
    slot_window: '08:00 AM - 09:00 AM',
    crop_type: 'Wheat (Sharbati)',
    crop_variety: 'HD-3086',
    estimated_kg: 2500,
    rate_per_quintal: 2275,
    hmac_token: '9e7b29a6e1f0e4b7c8a1132049e7b29a6e1f0e4b7c8a113204e7b29a6e1f0e4b',
    status: 'CONFIRMED',
    vehicle_number: 'HR-05-AB-7721',
    rfid_tag: 'UHF-TAG-891024',
    distance_km: 14.2,
    created_at: '2026-09-18T06:30:00.000Z',
  },
  {
    id: 'BK-2026-002',
    farmer_id: 'FARM-9902',
    farmer_name: 'Gurmeet Singh Dhillon',
    farmer_phone: '+91 98765 43210',
    farmer_village: 'Samrala Khurd',
    mandi_id: 'mandi-02',
    mandi_name: 'Khanna Grain Mega Market',
    slot_id: 'slot-02',
    slot_window: '09:00 AM - 10:00 AM',
    crop_type: 'Paddy (Basmati 1121)',
    estimated_kg: 3200,
    actual_gross_kg: 7200,
    rate_per_quintal: 3850,
    hmac_token: 'f4b321a08e12d49c8901237ba45e1289c09123847eab12894567ac891234ef90',
    status: 'WEIGHED_GROSS',
    vehicle_number: 'PB-10-CD-4512',
    rfid_tag: 'UHF-TAG-771920',
    distance_km: 18.5,
    created_at: '2026-09-18T06:45:00.000Z',
    gate_entry_at: '2026-09-18T08:55:00.000Z',
    gross_weighed_at: '2026-09-18T09:12:00.000Z',
  },
  {
    id: 'BK-2026-003',
    farmer_id: 'FARM-5512',
    farmer_name: 'Jagjit Singh Mann',
    farmer_phone: '+91 98888 11223',
    farmer_village: 'Gharaunda Sub-Tehsil',
    mandi_id: 'mandi-01',
    mandi_name: 'Karnal Central APMC Mandi',
    slot_id: 'slot-01',
    slot_window: '07:00 AM - 08:00 AM',
    crop_type: 'Mustard (Sarson)',
    estimated_kg: 1800,
    actual_gross_kg: 5800,
    actual_tare_kg: 4000,
    actual_net_kg: 1800,
    rate_per_quintal: 5450,
    total_payout_inr: 98100,
    hmac_token: 'c0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f',
    status: 'COMPLETED',
    vehicle_number: 'HR-05-XY-3301',
    rfid_tag: 'UHF-TAG-330199',
    distance_km: 11.8,
    created_at: '2026-09-18T05:30:00.000Z',
    gate_entry_at: '2026-09-18T07:05:00.000Z',
    gross_weighed_at: '2026-09-18T07:18:00.000Z',
    tare_weighed_at: '2026-09-18T07:42:00.000Z',
  },
];

const INITIAL_LOGS: TelemetryLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-09-18T07:05:01.210Z',
    device_id: 'ESP32-GATE-NODE-01',
    sensor_type: 'RFID_UHF',
    action: 'RFID_DETECTED_TAG',
    raw_payload: 'TAG_ID=UHF-TAG-330199,RSSI=-58dBm,FREQ=866.5MHz',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-002',
    timestamp: '2026-09-18T07:05:02.100Z',
    device_id: 'ESP32-GATE-NODE-01',
    sensor_type: 'SERVO_BARRIER',
    action: 'BARRIER_GATE_OPEN_PULSE',
    raw_payload: 'RELAY=HIGH,SERVO_ANGLE=90_DEG,CLEARANCE_SEC=15',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-09-18T07:18:22.450Z',
    device_id: 'ESP32-SCALE-NODE-01',
    sensor_type: 'HX711_ADC',
    action: 'GROSS_WEIGHT_CAPTURED',
    raw_payload: 'RAW_CH_A=0x4A21F0,STABLE=TRUE,WEIGHT_KG=5800,OFFSET=2450',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-004',
    timestamp: '2026-09-18T07:42:15.890Z',
    device_id: 'ESP32-SCALE-NODE-01',
    sensor_type: 'HX711_ADC',
    action: 'TARE_WEIGHT_NET_CALCULATED',
    raw_payload: 'TARE_KG=4000,NET_KG=1800,VARIANCE_TOLERANCE_PCT=0.2%',
    status: 'SUCCESS',
  },
];

class MandiSyncDatabase {
  private mandis: Mandi[] = [...INITIAL_MANDIS];
  private bookings: Booking[] = [...INITIAL_BOOKINGS];
  private logs: TelemetryLog[] = [...INITIAL_LOGS];

  getMandis(farmerLat?: number, farmerLon?: number): (Mandi & { distance_km?: number })[] {
    return this.mandis.map((m) => {
      const dist =
        farmerLat !== undefined && farmerLon !== undefined
          ? calculateHaversineDistance(farmerLat, farmerLon, m.latitude, m.longitude)
          : undefined;
      return {
        ...m,
        distance_km: dist,
      };
    });
  }

  getSlotsForMandi(mandiId: string): Slot[] {
    return [
      {
        id: 'slot-01',
        mandi_id: mandiId,
        window_start: '08:00 AM',
        window_end: '09:00 AM',
        total_capacity_kg: 5000,
        booked_kg: 2500,
        is_available: true,
      },
      {
        id: 'slot-02',
        mandi_id: mandiId,
        window_start: '09:00 AM',
        window_end: '10:00 AM',
        total_capacity_kg: 5000,
        booked_kg: 3200,
        is_available: true,
      },
      {
        id: 'slot-03',
        mandi_id: mandiId,
        window_start: '10:00 AM',
        window_end: '11:00 AM',
        total_capacity_kg: 5000,
        booked_kg: 4800,
        is_available: true,
      },
      {
        id: 'slot-04',
        mandi_id: mandiId,
        window_start: '11:00 AM',
        window_end: '12:00 PM',
        total_capacity_kg: 5000,
        booked_kg: 5000,
        is_available: false,
      },
    ];
  }

  getBookings(): Booking[] {
    return [...this.bookings].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getBookingByRfid(rfidTag: string): Booking | undefined {
    return this.bookings.find(
      (b) =>
        b.rfid_tag.trim().toUpperCase() === rfidTag.trim().toUpperCase() &&
        b.status !== 'COMPLETED' &&
        b.status !== 'CANCELLED'
    );
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  createBooking(data: {
    farmerName: string;
    farmerPhone: string;
    farmerVillage: string;
    farmerLat: number;
    farmerLon: number;
    mandiId: string;
    slotId: string;
    cropType: string;
    cropVariety?: string;
    estimatedKg: number;
    vehicleNumber: string;
    rfidTag: string;
  }): Booking {
    const mandi = this.mandis.find((m) => m.id === data.mandiId) || this.mandis[0];
    const dist = calculateHaversineDistance(
      data.farmerLat,
      data.farmerLon,
      mandi.latitude,
      mandi.longitude
    );

    const bookingId = `BK-2026-${String(this.bookings.length + 1).padStart(3, '0')}`;
    const hmacToken = `HMAC_${Math.random().toString(36).substring(2)}${Date.now()}`;

    const newBooking: Booking = {
      id: bookingId,
      farmer_id: `FARM-${Math.floor(1000 + Math.random() * 9000)}`,
      farmer_name: data.farmerName,
      farmer_phone: data.farmerPhone,
      farmer_village: data.farmerVillage,
      mandi_id: data.mandiId,
      mandi_name: mandi.name,
      slot_id: data.slotId,
      slot_window: '08:00 AM - 09:00 AM',
      crop_type: data.cropType,
      crop_variety: data.cropVariety || 'Grade A',
      estimated_kg: data.estimatedKg,
      rate_per_quintal: data.cropType.includes('Wheat') ? 2275 : 3850,
      hmac_token: hmacToken,
      status: 'CONFIRMED',
      vehicle_number: data.vehicleNumber.toUpperCase(),
      rfid_tag: data.rfidTag.toUpperCase(),
      distance_km: dist,
      created_at: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);
    mandi.allocated_today_kg += data.estimatedKg;
    mandi.active_queue_count += 1;

    this.logTelemetry({
      device_id: 'WEB-PORTAL-CLIENT',
      sensor_type: 'LITTLEFS_BUFFER',
      action: 'SLOT_RESERVATION_DB_BATCH',
      raw_payload: `BOOKING_ID=${bookingId},FARMER=${data.farmerName},VEHICLE=${data.vehicleNumber}`,
      status: 'SUCCESS',
    });

    return newBooking;
  }

  verifyGateEntry(rfidTag: string, deviceId = 'ESP32-GATE-NODE-01'): {
    success: boolean;
    booking?: Booking;
    message: string;
  } {
    const booking = this.getBookingByRfid(rfidTag);
    if (!booking) {
      this.logTelemetry({
        device_id: deviceId,
        sensor_type: 'RFID_UHF',
        action: 'GATE_ENTRY_UNAUTHORIZED',
        raw_payload: `TAG=${rfidTag},RESULT=NO_VALID_SLOT_FOUND`,
        status: 'WARNING',
      });
      return { success: false, message: 'No active booked slot found for this RFID tag.' };
    }

    booking.status = 'GATE_VERIFIED';
    booking.gate_entry_at = new Date().toISOString();

    this.logTelemetry({
      device_id: deviceId,
      sensor_type: 'RFID_UHF',
      action: 'GATE_ENTRY_VERIFIED_SUCCESS',
      raw_payload: `TAG=${rfidTag},BOOKING_ID=${booking.id},FARMER=${booking.farmer_name}`,
      status: 'SUCCESS',
    });

    this.logTelemetry({
      device_id: deviceId,
      sensor_type: 'SERVO_BARRIER',
      action: 'SERVO_RELAY_OPEN_COMMAND',
      raw_payload: 'ANGLE=90,DURATION_MS=15000',
      status: 'SUCCESS',
    });

    return { success: true, booking, message: 'Valid slot confirmed. Barrier gate opened.' };
  }

  updateWeighbridgeMeasurement(params: {
    bookingId?: string;
    rfidTag?: string;
    weightKg: number;
    type: 'GROSS' | 'TARE';
    moisturePct?: number;
    deviceId?: string;
    isOfflineBuffered?: boolean;
  }): { success: boolean; booking?: Booking; netKg?: number } {
    let booking: Booking | undefined;
    if (params.bookingId) {
      booking = this.getBookingById(params.bookingId);
    } else if (params.rfidTag) {
      booking = this.getBookingByRfid(params.rfidTag);
    }

    if (!booking && this.bookings.length > 0) {
      booking = this.bookings.find((b) => b.status === 'GATE_VERIFIED' || b.status === 'WEIGHED_GROSS') || this.bookings[0];
    }

    if (!booking) {
      return { success: false };
    }

    const deviceId = params.deviceId || 'ESP32-SCALE-NODE-01';

    if (params.type === 'GROSS') {
      booking.actual_gross_kg = params.weightKg;
      booking.status = 'WEIGHED_GROSS';
      booking.gross_weighed_at = new Date().toISOString();
      if (params.moisturePct) booking.moisture_pct = params.moisturePct;

      this.logTelemetry({
        device_id: deviceId,
        sensor_type: 'HX711_ADC',
        action: 'WEIGHBRIDGE_GROSS_RECORDED',
        raw_payload: `WEIGHT_KG=${params.weightKg},BOOKING_ID=${booking.id}`,
        status: params.isOfflineBuffered ? 'OFFLINE_BUFFERED' : 'SUCCESS',
      });
      return { success: true, booking };
    } else {
      booking.actual_tare_kg = params.weightKg;
      const gross = booking.actual_gross_kg || params.weightKg + 2500;
      booking.actual_gross_kg = gross;
      const net = Math.max(0, gross - params.weightKg);
      booking.actual_net_kg = net;
      booking.status = 'COMPLETED';
      booking.tare_weighed_at = new Date().toISOString();

      const quintals = net / 100;
      booking.total_payout_inr = Math.round(quintals * booking.rate_per_quintal);

      const mandi = this.mandis.find((m) => m.id === booking?.mandi_id);
      if (mandi) {
        mandi.active_queue_count = Math.max(0, mandi.active_queue_count - 1);
      }

      this.logTelemetry({
        device_id: deviceId,
        sensor_type: 'HX711_ADC',
        action: 'WEIGHBRIDGE_TARE_NET_COMPLETED',
        raw_payload: `TARE_KG=${params.weightKg},NET_KG=${net},PAYOUT_INR=${booking.total_payout_inr}`,
        status: params.isOfflineBuffered ? 'OFFLINE_BUFFERED' : 'SUCCESS',
      });

      return { success: true, booking, netKg: net };
    }
  }

  logTelemetry(log: Omit<TelemetryLog, 'id' | 'timestamp'>) {
    const newLog: TelemetryLog = {
      id: `LOG-${String(this.logs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 80) {
      this.logs.pop();
    }
    return newLog;
  }

  getTelemetryLogs(limit = 40): TelemetryLog[] {
    return this.logs.slice(0, limit);
  }

  resetDemoData() {
    this.mandis = [...INITIAL_MANDIS];
    this.bookings = [...INITIAL_BOOKINGS];
    this.logs = [...INITIAL_LOGS];
  }
}

export const db = new MandiSyncDatabase();
