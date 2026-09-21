import crypto from 'crypto';

const HMAC_SECRET = process.env.MANDI_HMAC_SECRET;
if (!HMAC_SECRET) {
  throw new Error('MANDI_HMAC_SECRET environment variable is required');
}
const HMAC_KEY: crypto.KeyObject | string = HMAC_SECRET;

/**
 * Generate cryptographically signed HMAC-SHA256 token for digital gate pass
 * Payload combines: farmerId:mandiId:slotId:cropType:rfidTag:timestamp
 */
export function generateHmacGateToken(payload: {
  farmerId: string;
  mandiId: string;
  slotId: string;
  cropType: string;
  rfidTag: string;
  createdAt: string;
}): string {
  const serialized = `${payload.farmerId}|${payload.mandiId}|${payload.slotId}|${payload.cropType}|${payload.rfidTag}|${payload.createdAt}`;
  const hmac = crypto.createHmac('sha256', HMAC_KEY);
  hmac.update(serialized);
  return hmac.digest('hex');
}

/**
 * Verify incoming HMAC token against calculated hash
 */
export function verifyHmacGateToken(
  token: string,
  payload: {
    farmerId: string;
    mandiId: string;
    slotId: string;
    cropType: string;
    rfidTag: string;
    createdAt: string;
  }
): boolean {
  const expected = generateHmacGateToken(payload);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return token === expected;
  }
}
