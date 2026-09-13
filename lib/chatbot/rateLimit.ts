import "server-only";
import { createHash } from "node:crypto";

const CHECK_QUOTA_SCRIPT = `
local ip_count = redis.call("INCR", KEYS[1])
if ip_count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[3])
end
local ip_ttl = redis.call("TTL", KEYS[1])
if ip_count > tonumber(ARGV[1]) then
  return {0, "ip", ip_count, 0, ip_ttl}
end

local daily_count = redis.call("INCR", KEYS[2])
if daily_count == 1 then
  redis.call("EXPIREAT", KEYS[2], ARGV[4])
end
local daily_ttl = redis.call("TTL", KEYS[2])
if daily_count > tonumber(ARGV[2]) then
  return {0, "daily", ip_count, daily_count, daily_ttl}
end

return {1, "ok", ip_count, daily_count, 0}
`;

interface RateLimitConfig {
  redisUrl: string;
  redisToken: string;
  perIpMax: number;
  windowSeconds: number;
  dailyMax: number;
  redisTimeoutMs: number;
  ipHeader: string;
  keyPrefix: string;
}

export type ChatbotQuotaResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; reason: "ip" | "daily" };

function positiveInteger(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function config(): RateLimitConfig | null {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!redisUrl && !redisToken) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Chatbot rate limiting is not configured");
    }
    return null;
  }
  if (!redisUrl || !redisToken) throw new Error("Both Upstash Redis credentials are required");

  const url = new URL(redisUrl);
  if (url.protocol !== "https:") throw new Error("UPSTASH_REDIS_REST_URL must use HTTPS");
  const ipHeader = process.env.CHATBOT_RATE_LIMIT_IP_HEADER?.trim().toLowerCase() || "x-forwarded-for";
  if (!/^[a-z0-9-]+$/.test(ipHeader)) throw new Error("CHATBOT_RATE_LIMIT_IP_HEADER is invalid");

  return {
    redisUrl: url.toString().replace(/\/$/, ""),
    redisToken,
    perIpMax: positiveInteger("CHATBOT_RATE_LIMIT_PER_IP_MAX", 10),
    windowSeconds: positiveInteger("CHATBOT_RATE_LIMIT_WINDOW_SECONDS", 60),
    dailyMax: positiveInteger("CHATBOT_DAILY_REQUEST_MAX", 500),
    redisTimeoutMs: positiveInteger("CHATBOT_RATE_LIMIT_REDIS_TIMEOUT_MS", 2_000),
    ipHeader,
    keyPrefix: process.env.CHATBOT_RATE_LIMIT_KEY_PREFIX?.trim() || "portfolio:chatbot",
  };
}

function clientIdentifier(request: Request, header: string): string {
  const forwarded = request.headers.get(header)?.split(",", 1)[0]?.trim() || "unknown";
  return createHash("sha256").update(forwarded).digest("hex");
}

function secondsUntilNextUtcDay(now: Date): number {
  const nextDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((nextDay - now.getTime()) / 1_000));
}

export async function checkChatbotQuota(request: Request, now = new Date()): Promise<ChatbotQuotaResult> {
  const settings = config();
  if (!settings) return { allowed: true };

  const day = now.toISOString().slice(0, 10);
  const ipKey = `${settings.keyPrefix}:ip:${clientIdentifier(request, settings.ipHeader)}`;
  const dailyKey = `${settings.keyPrefix}:daily:${day}`;
  const nextDayUnixSeconds = Math.floor(now.getTime() / 1_000) + secondsUntilNextUtcDay(now);
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(settings.redisTimeoutMs)]);
  const response = await fetch(settings.redisUrl, {
    method: "POST",
    cache: "no-store",
    signal,
    headers: {
      Authorization: `Bearer ${settings.redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      "EVAL",
      CHECK_QUOTA_SCRIPT,
      2,
      ipKey,
      dailyKey,
      settings.perIpMax,
      settings.dailyMax,
      settings.windowSeconds,
      nextDayUnixSeconds,
    ]),
  });
  if (!response.ok) throw new Error(`Rate limit store failed (${response.status})`);

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("result" in payload) || !Array.isArray(payload.result)) {
    throw new Error("Invalid rate limit store response");
  }
  const [allowed, reason, , , retryAfter] = payload.result;
  if (allowed === 1) return { allowed: true };
  if (allowed !== 0 || (reason !== "ip" && reason !== "daily") || typeof retryAfter !== "number") {
    throw new Error("Invalid rate limit decision");
  }
  return { allowed: false, reason, retryAfterSeconds: Math.max(1, Math.ceil(retryAfter)) };
}
