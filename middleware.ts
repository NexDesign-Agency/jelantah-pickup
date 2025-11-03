import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth-export";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if path needs protection
  const protectedPaths = ["/admin", "/customer", "/courier", "/warehouse"];
  const needsProtection = protectedPaths.some((p) => path.startsWith(p));
  
  if (!needsProtection) {
    return NextResponse.next();
  }

  try {
    const session = await auth();
    
    // Redirect to login if not authenticated
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based route protection
    const role = session.user.role as UserRole;

    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (path.startsWith("/customer") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (path.startsWith("/courier") && role !== "COURIER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (path.startsWith("/warehouse") && role !== "WAREHOUSE") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
    "/courier/:path*",
    "/warehouse/:path*",
  ],
};

