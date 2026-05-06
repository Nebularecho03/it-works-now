import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting store (use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const windowKey = Math.floor(now / windowMs);
  const key = `${ip}:${windowKey}`;

  const current = rateLimit.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + windowMs;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  rateLimit.set(key, current);
  return true;
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || "";
  const suspiciousPatterns = [
    /sqlmap/i,
    /nmap/i,
    /masscan/i,
    /dirbuster/i,
    /gobuster/i,
    /nikto/i,
    /acunetix/i,
    /openvas/i,
    /nessus/i,
    /qualys/i,
    /rapid7/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ||
             request.headers.get("x-real-ip") ||
             "unknown";

  if (!checkRateLimit(ip)) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  if (isSuspiciousRequest(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  response.headers.set("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive");

  if (request.method === "GET" && request.nextUrl.pathname.startsWith("/uploads/")) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  if (request.url.startsWith("https://")) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
