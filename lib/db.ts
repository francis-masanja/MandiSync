import { Mandi, Slot, Booking, TelemetryLog } from '@/lib/types';
import { calculateHaversineDistance } from '@/lib/spatial';
import prisma from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';

// ------------------------------------------------------
// 1. Type Definitions
// ------------------------------------------------------
interface SyncLittleFsBatchPacket {
  booking_id?: string;
  rfid_tag?: string;
  weight_kg: number;
  measurement_type: 'GROSS' | 'TARE';
  moisture_percentage?: number;
  device_id: string;
  source: 'LIVE_SENSOR_ADC' | 'LITTLEFS_BUFFER';
  timestamp: string;
}

interface WeighbridgeParams {
  bookingId?: string;
  rfidTag?: string;
  weightKg: number;
  type: 'GROSS' | 'TARE';
  moisturePct?: number;
  deviceId?: string;
  isOfflineBuffered?: boolean;
}

interface CreateBookingData {
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
  farmerId?: string;
}

interface TelemetryEntry extends Omit<TelemetryLog, 'id' | 'createdAt'> {}

interface BookingFilters {
  status?: { in?: string[] };
  mandiId?: string;
  farmerId?: string;
}

// ------------------------------------------------------
// In-memory demo database (fallback when no DATABASE_URL)
// ------------------------------------------------------
const INITIAL_MANDIS: Mandi[] = [
  {
    id: 'mandi-01',
    name: 'Karnal Central APMC Mandi',
    location: 'Karnal, Haryana',
    latitude: 29.6857,
    longitude: 76.9905,
    maxDailyKg: 10000,
    allocatedTodayKg: 5500,
    activeQueueCount: 3,
    avgWaitMinutes: 25,
  },
  {
    id: 'mandi-02',
    name: 'Khanna Grain Mega Market',
    location: 'Ludhiana, Punjab',
    latitude: 30.7071,
    longitude: 76.2167,
    maxDailyKg: 15000,
    allocatedTodayKg: 7200,
    activeQueueCount: 5,
    avgWaitMinutes: 35,
  },
  {
    id: 'mandi-03',
    name: 'Kota Bhamashah Krishi Mandi',
    location: 'Kota, Rajasthan',
    latitude: 25.1843,
    longitude: 75.8427,
    maxDailyKg: 8000,
    allocatedTodayKg: 4100,
    activeQueueCount: 2,
    avgWaitMinutes: 20,
  },
  {
    id: 'mandi-04',
    name: 'Indore Laxmibai Nagar Mandi',
    location: 'Indore, Madhya Pradesh',
    latitude: 22.7533,
    longitude: 75.8937,
    maxDailyKg: 12000,
    allocatedTodayKg: 6800,
    activeQueueCount: 4,
    avgWaitMinutes: 30,
  },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-2026-001',
    farmerId: 'FARM-8821',
    farmerName: 'Harpreet Singh Sandhu',
    farmerPhone: '+91 98140 12345',
    farmerVillage: 'Taraori Farm Cluster',
    mandiId: 'mandi-01',
    mandiName: 'Karnal Central APMC Mandi',
    slotId: 'slot-01',
    slotWindow: '08:00 AM - 09:00 AM',
    cropType: 'Wheat (Sharbati)',
    cropVariety: 'HD-3086',
    estimatedKg: 2500,
    ratePerQuintal: 2275,
    hmacToken: '',
    status: 'CONFIRMED',
    vehicleNumber: 'HR-05-AB-7721',
    rfidTag: 'UHF-TAG-891024',
    distanceKm: 14.2,
    createdAt: new Date(),
  },
  {
    id: 'BK-2026-002',
    farmerId: 'FARM-9902',
    farmerName: 'Gurmeet Singh Dhillon',
    farmerPhone: '+91 98765 43210',
    farmerVillage: 'Samrala Khurd',
    mandiId: 'mandi-02',
    mandiName: 'Khanna Grain Mega Market',
    slotId: 'slot-02',
    slotWindow: '09:00 AM - 10:00 AM',
    cropType: 'Paddy (Basmati 1121)',
    estimatedKg: 3200,
    ratePerQuintal: 3850,
    hmacToken: '',
    status: 'WEIGHED_GROSS',
    vehicleNumber: 'PB-10-CD-4512',
    rfidTag: 'UHF-TAG-771920',
    distanceKm: 18.5,
    createdAt: new Date(),
    gateEntryAt: new Date(),
    grossWeighedAt: new Date(),
  },
];

const INITIAL_LOGS: TelemetryLog[] = [];

// ------------------------------------------------------
// 1. In-memory fallback (used when DATABASE_URL is not set)
// ------------------------------------------------------
class InMemoryDb {
  private mandis = [...INITIAL_MANDIS];
  private bookings = [...INITIAL_BOOKINGS];
  private logs = [...INITIAL_LOGS];

  async getMandis(): Promise<Mandi[]> {
    return this.mandis.map((m) => ({ ...m }));
  }

  async getBookings(): Promise<Booking[]> {
    return this.bookings
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return this.bookings.find((b) => b.id === id);
  }

  async resetDemoData(): Promise<boolean> {
    this.mandis = [...INITIAL_MANDIS];
    this.bookings = [...INITIAL_BOOKINGS];
    this.logs = [];
    return true;
  }

  getMandisWithDistance(farmerLat?: number, farmerLon?: number) {
    return this.mandis.map((m) => {
      const dist =
        farmerLat !== undefined && farmerLon !== undefined
          ? calculateHaversineDistance(farmerLat, farmerLon, m.latitude, m.longitude)
          : undefined;
      return { ...m, distanceKm: dist };
    });
  }

  getSlotsForMandi(mandiId: string): Slot[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return [
      { id: 'slot-01', mandiId, startTime: new Date(today.getTime() + 8 * 3600000), endTime: new Date(today.getTime() + 9 * 3600000), isBooked: false, windowStart: '08:00 AM', windowEnd: '09:00 AM', totalCapacityKg: 5000, bookedKg: 2500, isAvailable: true },
      { id: 'slot-02', mandiId, startTime: new Date(today.getTime() + 9 * 3600000), endTime: new Date(today.getTime() + 10 * 3600000), isBooked: false, windowStart: '09:00 AM', windowEnd: '10:00 AM', totalCapacityKg: 5000, bookedKg: 3200, isAvailable: true },
      { id: 'slot-03', mandiId, startTime: new Date(today.getTime() + 10 * 3600000), endTime: new Date(today.getTime() + 11 * 3600000), isBooked: false, windowStart: '10:00 AM', windowEnd: '11:00 AM', totalCapacityKg: 5000, bookedKg: 4800, isAvailable: true },
      { id: 'slot-04', mandiId, startTime: new Date(today.getTime() + 11 * 3600000), endTime: new Date(today.getTime() + 12 * 3600000), isBooked: true, windowStart: '11:00 AM', windowEnd: '12:00 PM', totalCapacityKg: 5000, bookedKg: 5000, isAvailable: false },
    ];
  }

  createBooking(data: CreateBookingData): Booking {
    const mandi = this.mandis.find((m) => m.id === data.mandiId) || this.mandis[0];
    const dist = calculateHaversineDistance(data.farmerLat, data.farmerLon, mandi.latitude, mandi.longitude);
    const bookingId = `BK-2026-${String(this.bookings.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const newBooking: Booking = {
      id: `BK-2026-${String(this.bookings.length + 1).padStart(3, '0')}`,
      farmerId: data.farmerId ?? `FARM-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerName: data.farmerName,
      farmerPhone: data.farmerPhone,
      farmerVillage: data.farmerVillage,
      mandiId: data.mandiId,
      mandiName: mandi.name,
      slotId: data.slotId,
      slotWindow: '08:00 AM - 09:00 AM',
      cropType: data.cropType,
      cropVariety: data.cropVariety || 'Grade A',
      estimatedKg: data.estimatedKg,
      ratePerQuintal: data.cropType.includes('Wheat') ? 2275 : 3850,
      hmacToken: '',
      status: 'CONFIRMED',
      vehicleNumber: data.vehicleNumber.toUpperCase(),
      rfidTag: data.rfidTag.toUpperCase(),
      distanceKm: dist,
      createdAt: now,
    };
    this.bookings.unshift(newBooking);
    mandi.allocatedTodayKg += data.estimatedKg;
    mandi.activeQueueCount += 1;
    return newBooking;
  }

  verifyGateEntry(rfidTag: string) {
    const booking = this.bookings.find((b) => b.rfidTag === rfidTag && b.status === 'CONFIRMED');
    if (!booking) return { success: false, message: 'No active booking' };
    booking.status = 'GATE_VERIFIED';
    booking.gateEntryAt = new Date();
    return { success: true, booking };
  }

  syncLittleFsBatch(packets: SyncLittleFsBatchPacket[]): { syncedCount: number } {
    const syncedCount = Array.isArray(packets) ? packets.length : 0;
    return { syncedCount };
  }

  updateWeighbridgeMeasurement(params: WeighbridgeParams) {
    const booking = this.bookings.find((b) => b.id === params.bookingId || b.rfidTag === params.rfidTag);
    if (!booking) return { success: false };
    if (params.type === 'GROSS') {
      booking.actualGrossKg = params.weightKg;
      booking.status = 'WEIGHED_GROSS';
      booking.grossWeighedAt = new Date();
    } else {
      booking.actualTareKg = params.weightKg;
      const gross = booking.actualGrossKg ?? params.weightKg + 2500;
      booking.actualGrossKg = gross;
      const net = Math.max(0, gross - params.weightKg);
      booking.actualNetKg = net;
      booking.status = 'COMPLETED';
      booking.tareWeighedAt = new Date();
      booking.totalPayoutInr = Math.round((net / 100) * (booking.ratePerQuintal ?? 0));
    }
    return { success: true, booking, netKg: booking.actualNetKg };
  }

  logTelemetry(entry: TelemetryEntry): TelemetryLog {
    const log: TelemetryLog = { id: `LOG-${this.logs.length + 1}`, createdAt: new Date(), ...entry };
    this.logs.unshift(log);
    if (this.logs.length > 80) this.logs.pop();
    return log;
  }

  async getTelemetryLogs(limit?: number): Promise<TelemetryLog[]> {
    const all = [...this.logs];
    if (limit) return all.slice(0, limit);
    return all;
  }
}

// ------------------------------------------------------
// 2. Prisma implementation – thin wrapper exposing the same method names
// ------------------------------------------------------
const prismaDb = {
  // Mandis
  async getMandis(): Promise<Mandi[]> {
    return await prisma.mandi.findMany();
  },
  async getMandisWithDistance(farmerLat?: number, farmerLon?: number): Promise<(Mandi & { distanceKm?: number })[]> {
    const mandis = await prisma.mandi.findMany();
    return mandis.map((m) => {
      const dist =
        farmerLat !== undefined && farmerLon !== undefined
          ? calculateHaversineDistance(farmerLat, farmerLon, m.latitude, m.longitude)
          : undefined;
      return { ...m, distanceKm: dist };
    });
  },
  // Slots
  async getSlotsForMandi(mandiId: string): Promise<Slot[]> {
    return await prisma.slot.findMany({ where: { mandiId } });
  },
  // Bookings
  async getBookings(): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        mandi: true,
        slot: true,
      },
    });

    return bookings.map((booking) => {
      if (booking.mandi) {
        const dist = calculateHaversineDistance(
          booking.farmerLat,
          booking.farmerLon,
          booking.mandi.latitude,
          booking.mandi.longitude
        );
        return { ...booking, distanceKm: dist };
      }
      return { ...booking, distanceKm: undefined };
    });
  },
  async getBookingById(id: string): Promise<Booking | null> {
    return await prisma.booking.findUnique({ where: { id } });
  },
  async createBooking(data: CreateBookingData): Promise<Booking> {
    const { farmerId, ...rest } = data;
    const dataToCreate: Record<string, unknown> = { ...rest };
    if (data.farmerId) {
      dataToCreate.farmerId = data.farmerId;
    }
    const created = await prisma.booking.create({
      data: dataToCreate as any,
    });
    return created as unknown as Booking;
  },
  async verifyGateEntry(rfidTag: string): Promise<{ success: boolean; message?: string; booking?: Booking }> {
    const booking = await prisma.booking.findFirst({ where: { rfidTag, status: 'CONFIRMED' } });
    if (!booking) return { success: false, message: 'No active booking' };
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'GATE_VERIFIED', gateEntryAt: new Date().toISOString() },
    });
    return { success: true, booking: updated as unknown as Booking };
  },
  async updateWeighbridgeMeasurement(params: WeighbridgeParams) {
    const where = params.bookingId ? { id: params.bookingId } : { rfidTag: params.rfidTag };
    const booking = await prisma.booking.findFirst({ where });
    if (!booking) return { success: false };

    if (params.type === 'GROSS') {
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          actualGrossKg: params.weightKg,
          status: 'WEIGHED_GROSS',
          grossWeighedAt: new Date().toISOString(),
        },
      });
      return { success: true, booking: updated as unknown as Booking, netKg: undefined };
    } else {
      const gross = booking.actualGrossKg ?? params.weightKg + 2500;
      const net = Math.max(0, gross - params.weightKg);
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          actualTareKg: params.weightKg,
          actualGrossKg: gross,
          actualNetKg: net,
          status: 'COMPLETED',
          tareWeighedAt: new Date().toISOString(),
          totalPayoutInr: Math.round((net / 100) * (booking.ratePerQuintal ?? 0)),
        },
      });
      return { success: true, booking: updated as unknown as Booking, netKg: net };
    }
  },
  // Telemetry logs
  async logTelemetry(entry: TelemetryEntry): Promise<TelemetryLog> {
    return await prisma.telemetry.create({ data: entry }) as unknown as TelemetryLog;
  },
  async getTelemetryLogs(limit?: number): Promise<TelemetryLog[]> {
    const logs = await prisma.telemetry.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit ?? undefined,
    });
    return logs as unknown as TelemetryLog[];
  },
  // Demo reset – for now just a no‑op returning true
  async resetDemoData(): Promise<boolean> {
    return true;
  },
  // Misc helpers kept for compatibility
  syncLittleFsBatch(packets: SyncLittleFsBatchPacket[]): { syncedCount: number } {
    const syncedCount = Array.isArray(packets) ? packets.length : 0;
    return { syncedCount };
  },
};

// ------------------------------------------------------
// 3. Exported singleton – Prisma when DATABASE_URL exists, otherwise in-memory
// ------------------------------------------------------
const usePrisma = !!process.env.DATABASE_URL;
const dbInstance = usePrisma ? prismaDb : new InMemoryDb();

export const db = dbInstance;

// Compatibility layer for legacy API routes expecting Prisma‑like objects
export const booking = {
  async findMany(opts?: BookingFilters): Promise<Booking[]> {
    const all = await db.getBookings();
    if (opts?.status?.in) {
      return all.filter((b) => opts.status!.in!.includes(b.status));
    }
    return all;
  },
};

export const telemetryLog = {
  async findMany(opts?: { take?: number }): Promise<TelemetryLog[]> {
    const limit = opts?.take ?? 40;
    const all = await db.getTelemetryLogs(limit);
    return all;
  },
};

export const mandi = {
  async findMany(opts?: { limit?: number; offset?: number }): Promise<Mandi[]> {
    const mandis = await db.getMandis();
    return mandis;
  },
};