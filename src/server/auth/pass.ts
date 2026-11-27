import { createHmac, timingSafeEqual } from 'crypto';

export type GatePassClaims = {
  v: 1;
  bid: string;
  fid: string;
  sid: string;
  iat: number;
};

const PREFIX = 'MANDISYNC1';

function secret(): string {
  const value = process.env.MANDI_HMAC_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) {
    throw new Error('MANDI_HMAC_SECRET or NEXTAUTH_SECRET must be set to sign gate passes');
  }
  return value;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function signGatePass(booking: {
  id: string;
  farmerId: string;
  slotId: string;
}): string {
  const claims: GatePassClaims = {
    v: 1,
    bid: booking.id,
    fid: booking.farmerId,
    sid: booking.slotId,
    iat: Date.now(),
  };
  const payload = Buffer.from(JSON.stringify(claims), 'utf8').toString('base64url');
  return `${PREFIX}.${payload}.${sign(payload)}`;
}

export function verifyGatePass(
  token: string
): { ok: true; claims: GatePassClaims } | { ok: false; reason: string } {
  const value = String(token || '').trim();
  const parts = value.split('.');
  if (parts.length !== 3 || parts[0] !== PREFIX) {
    return { ok: false, reason: 'Not a MandiSync gate pass' };
  }
  const [, payload, signature] = parts;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: 'Gate pass signature is invalid' };
  }
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as GatePassClaims;
    if (
      claims?.v !== 1 ||
      typeof claims.bid !== 'string' ||
      typeof claims.fid !== 'string' ||
      typeof claims.sid !== 'string'
    ) {
      return { ok: false, reason: 'Gate pass payload is invalid' };
    }
    return { ok: true, claims };
  } catch {
    return { ok: false, reason: 'Gate pass payload is invalid' };
  }
}
