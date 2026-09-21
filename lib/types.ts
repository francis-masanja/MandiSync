export interface Mandi {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  maxDailyKg: number;
  allocatedTodayKg: number;
  activeQueueCount: number;
  avgWaitMinutes: number;
}

export interface Slot {
  id: string;
  mandiId: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  windowStart?: string;
  windowEnd?: string;
  totalCapacityKg?: number;
  bookedKg?: number;
  isAvailable?: boolean;
}

export interface Booking {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerVillage: string;
  mandiId: string;
  mandiName?: string;
  slotId: string;
  slotWindow?: string;
  cropType: string;
  cropVariety?: string;
  estimatedKg: number;
  actualGrossKg?: number | null;
  actualTareKg?: number | null;
  actualNetKg?: number | null;
  moisturePct?: number | null;
  ratePerQuintal: number | null;
  totalPayoutInr?: number | null;
  hmacToken: string | null;
  status: string;
  vehicleNumber: string;
  rfidTag: string;
  distanceKm?: number;
  createdAt: Date;
  gateEntryAt?: Date | null;
  grossWeighedAt?: Date | null;
  tareWeighedAt?: Date | null;
  mandi?: Mandi;
  slot?: Slot;
}

export interface TelemetryLog {
  id: string;
  bookingId: string;
  rfidTag: string;
  type: string;
  weightKg: number;
  moisturePct?: number | null;
  deviceId: string;
  source: string;
  createdAt: Date;
}