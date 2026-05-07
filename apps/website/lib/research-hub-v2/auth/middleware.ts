import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Public paths that don't require authentication
const publicPaths = [
  "/research-hub-v2/public",
  "/research-hub-v2/auth/login",
  "/research-hub-v2/auth/register",
  "/api/research-hub-v2/auth/login",
  "/api/research-hub-v2/auth/register"
];

// Admin-only paths
const adminPaths = [
  "/research-hub-v2/admin",
  "/api/research-hub-v2/admin"
];

// Premium-only paths
const premiumPaths = [
  "/research-hub-v2/user/downloads",
  "/research-hub-v2/user/export"
];

export async function researchHubMiddleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // Check if path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get session from cookie
  const sessionCookie = request.cookies.get("research-hub-session");
  
  if (!sessionCookie) {
    // Redirect to login for protected routes
    if (pathname.startsWith("/research-hub-v2")) {
      return NextResponse.redirect(new URL("/research-hub-v2/auth/login", request.url));
    }
    return NextResponse.next();
  }

  let sessionData;
  try {
    sessionData = JSON.parse(sessionCookie.value);
  } catch (error) {
    // Invalid session, redirect to login
    return NextResponse.redirect(new URL("/research-hub-v2/auth/login", request.url));
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: sessionData.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      subscription: true
    }
  });

  if (!user) {
    // User not found, redirect to login
    return NextResponse.redirect(new URL("/research-hub-v2/auth/login", request.url));
  }

  // Check admin access
  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (user.role !== "ADMIN" && user.role !== "ASSISTANT") {
      return NextResponse.redirect(new URL("/research-hub-v2/user/dashboard", request.url));
    }
  }

  // Check premium access
  if (premiumPaths.some(path => pathname.startsWith(path))) {
    if (user.subscription !== "PREMIUM") {
      return NextResponse.redirect(new URL("/research-hub-v2/user/subscriptions", request.url));
    }
  }

  // Add user info to request headers for downstream use
  const response = NextResponse.next();
  response.headers.set("x-user-id", user.id);
  response.headers.set("x-user-role", user.role);
  response.headers.set("x-user-subscription", user.subscription);

  return response;
}

// Feature access checker utilities
export const canAccessFeature = (
  userRole: string,
  userSubscription: string,
  feature: string
): boolean => {
  // Guest users
  if (userRole === "GUEST") {
    const guestFeatures = ["view_public_research", "browse_catalog"];
    return guestFeatures.includes(feature);
  }

  // Regular users
  if (userRole === "USER" && userSubscription === "FREE") {
    const freeFeatures = [
      "view_public_research",
      "browse_catalog", 
      "save_research",
      "basic_search",
      "send_messages"
    ];
    return freeFeatures.includes(feature);
  }

  // Premium users
  if (userSubscription === "PREMIUM") {
    const premiumFeatures = [
      "view_public_research",
      "browse_catalog",
      "save_research", 
      "basic_search",
      "advanced_search",
      "send_messages",
      "download_research",
      "export_research",
      "priority_support"
    ];
    return premiumFeatures.includes(feature);
  }

  // Admin users have all features
  if (userRole === "ADMIN" || userRole === "ASSISTANT") {
    return true;
  }

  return false;
};

// Route protection wrapper for API routes
export const withAuth = (
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  options: { requireAdmin?: boolean; requirePremium?: boolean } = {}
) => {
  return async (request: NextRequest) => {
    const sessionCookie = request.cookies.get("research-hub-session");
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Check admin requirement
    if (options.requireAdmin && user.role !== "ADMIN" && user.role !== "ASSISTANT") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Check premium requirement
    if (options.requirePremium && user.subscription !== "PREMIUM") {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    return handler(request, user);
  };
};
