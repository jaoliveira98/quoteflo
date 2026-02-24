/**
 * Auth rate limiting (login, signup, forgot-password, reset-password) per IP.
 * Optional: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.
 * If unset, no rate limiting is applied.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const AUTH_RATE_LIMIT_WINDOW_SEC = 60;
const AUTH_RATE_LIMIT_REQUESTS = 30;

let authRatelimit: Ratelimit | null = null;

function getAuthRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!authRatelimit) {
    const redis = new Redis({ url, token });
    authRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(AUTH_RATE_LIMIT_REQUESTS, `${AUTH_RATE_LIMIT_WINDOW_SEC} s`),
      analytics: false,
    });
  }
  return authRatelimit;
}

export async function checkAuthRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
  const limiter = getAuthRatelimit();
  if (!limiter) return { allowed: true, remaining: AUTH_RATE_LIMIT_REQUESTS };
  const result = await limiter.limit(identifier);
  return { allowed: result.success, remaining: result.remaining };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "anonymous";
  return ip;
}
