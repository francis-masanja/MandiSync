import { z } from 'zod';

export const GateVerifySchema = z.object({
  rfid_tag: z.string().min(1, 'RFID tag is required'),
  device_id: z.string().min(1, 'Device ID is required'),
});

export const WeighbridgeSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID format').optional(),
  rfid_tag: z.string().min(1).optional(),
  weight_kg: z.number().positive('Weight must be a positive number'),
  measurement_type: z.enum(['GROSS', 'TARE']),
  moisture_percentage: z.number().min(0).max(100).optional(),
  device_id: z.string().min(1, 'Device ID is required'),
  source: z.enum(['LIVE_SENSOR_ADC', 'LITTLEFS_BUFFER']).optional(),
});

export const BatchSyncSchema = z.object({
  packets: z.array(z.object({
    booking_id: z.string().uuid().optional(),
    rfid_tag: z.string().min(1).optional(),
    weight_kg: z.number().positive('Weight must be positive'),
    measurement_type: z.enum(['GROSS', 'TARE']),
    moisture_percentage: z.number().min(0).max(100).optional(),
    device_id: z.string().min(1, 'Device ID is required'),
    source: z.enum(['LIVE_SENSOR_ADC', 'LITTLEFS_BUFFER']),
    timestamp: z.string().datetime({ offset: true }),
  })).min(1, 'At least one packet is required').max(1000, 'Maximum 1000 packets per batch'),
});

export const MandisQuerySchema = z.object({
  farmer_lat: z.coerce.number().min(-90).max(90).optional(),
  farmer_lon: z.coerce.number().min(-180).max(180).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});