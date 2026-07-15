import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "supersecret-production-key-12345" });
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login")) {
    if (token) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  const MAIN_HUB_URL = process.env.MAIN_HUB_URL || "http://localhost:5173";

  if (!token) {
    return NextResponse.redirect(new URL(`${MAIN_HUB_URL}/login`));
  }

  try {
    const res = await fetch(`${MAIN_HUB_URL}/api/subscriptions?username=${token.name}`);
    if (!res.ok) {
      return NextResponse.redirect(new URL(`${MAIN_HUB_URL}/?error=api_error`));
    }
    const subscriptions = await res.json();
    const hasAccess = subscriptions.some(sub => sub.status === "active");
    if (!hasAccess && token.role !== "admin") {
      return NextResponse.redirect(new URL(`${MAIN_HUB_URL}/?error=unauthorized`));
    }
  } catch(error) {
    return NextResponse.redirect(new URL(`${MAIN_HUB_URL}/?error=server_error`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
