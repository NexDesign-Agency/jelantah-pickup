import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect to login if not authenticated
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based route protection
    const role = token.role as UserRole;

    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/customer") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/courier") && role !== "COURIER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/warehouse") && role !== "WAREHOUSE") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
    "/courier/:path*",
    "/warehouse/:path*",
  ],
};

