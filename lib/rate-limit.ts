// Simple in-memory rate limiter with no external dependencies
// Works in both development and production (uses in-memory Map)
// For production, consider using Redis or Vercel KV

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  constructor(private options: { limit: number; windowMs: number }) {}

  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);
    const { limit, windowMs } = this.options;
    
    if (!entry || Date.now() > entry.resetTime) {
      this.store.set(key, { count: 1, resetTime: Date.now() + this.options.windowMs });
      return { success: true, limit: this.options.limit, remaining: this.options.limit - 1, reset: Date.now() + this.options.windowMs };
    }
    
    if (entry.count >= this.options.limit) {
      return { success: false, limit: this.options.limit, remaining: 0, reset: entry.resetTime };
    }
    
    entry.count++;
    return { success: true, limit: this.options.limit, remaining: this.options.limit - entry.count, reset: entry.resetTime };
  }
}

// Create limiters
const ipLimiter = new InMemoryRateLimiter({ limit: 100, windowMs: 60_000 }); // 100 req/min per IP
const deviceLimiter = new InMemoryRateLimiter({ limit: 50, windowMs: 60_000 }); // 50 req/min per device

export async function checkRateLimit(ip: string, deviceId?: string): Promise<RateLimitResult> {
  const ipResult = await ipLimiter.limit(`ip:${ip}`);
  
  if (!ipResult.success) {
    return {
      success: false,
      limit: ipResult.limit,
      remaining: ipResult.remaining,
      reset: ipResult.reset,
    };
  }
  
  if (deviceId) {
    const deviceResult = await deviceLimiter.limit(`device:${deviceId}`);
    if (!deviceResult.success) {
      return {
        success: false,
        limit: deviceResult.limit,
        remaining: deviceResult.remaining,
        reset: deviceResult.reset,
      };
    }
    return {
      success: true,
      limit: Math.min(ipResult.limit, deviceResult.limit),
      remaining: Math.min(ipResult.remaining, deviceResult.remaining),
      reset: Math.max(ipResult.reset, deviceResult.reset),
    };
  }
  
  return {
    success: true,
    limit: ipResult.limit,
    remaining: ipResult.remaining,
    reset: ipResult.reset,
  };
}

export function getRateLimitHeaders(result: RateLimitResult) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
  };
}