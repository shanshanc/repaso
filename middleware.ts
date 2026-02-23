import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, computeToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.AUTH_SECRET;

  // Skip auth in dev when AUTH_SECRET is not configured
  if (!secret) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated =
    cookie !== undefined && cookie === (await computeToken(secret));

  // Redirect authenticated users away from /login
  if (pathname === "/login") {
    return isAuthenticated
      ? NextResponse.redirect(new URL("/sentences", request.url))
      : NextResponse.next();
  }

  // Let /api/ routes through (they handle their own auth if needed)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Protect everything else
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
