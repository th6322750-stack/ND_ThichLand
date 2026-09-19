import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/authConstants";

/**
 * Optimistic redirect only — checks cookie *presence*, not its signature or
 * expiry, so it must only ever deny (redirect anonymous visitors to login),
 * never grant. "Cookie present + on /admin/login → bounce to /admin" was
 * tried here and removed: a present-but-invalid/expired cookie made that
 * bounce fire, the real server DAL check would reject it and redirect back
 * to /admin/login, and the two rules ping-ponged forever. The "already
 * logged in, skip the login form" convenience now lives in
 * app/admin/login/page.tsx itself, gated on a real getSession() check —
 * real authorization always happens again in the server DAL via
 * getSession()/requireSession()/requireAdminPage() on every protected
 * page/action/route regardless of what this file decides.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSessionCookie && !isLoginRoute) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
