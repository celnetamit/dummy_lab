import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Retrieve the JWT token using the exact secret from NextAuth config
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "supersecret-production-key-12345" });
  const { pathname } = req.nextUrl;

  // 1. If the user is logged in and trying to access the login or register page, redirect them to the dashboard
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 2. Protect all other secure routes (if the user is NOT logged in, redirect to /login)
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Specify the paths where this middleware should run
export const config = {
  // Match all routes except API routes, static files, and Next.js internals
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
