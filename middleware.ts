import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkAuthRateLimit, getClientIdentifier } from "@/lib/rate-limit";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

export async function middleware(request: NextRequest) {
  if (isAuthPath(request.nextUrl.pathname)) {
    const id = getClientIdentifier(request);
    const { allowed } = await checkAuthRateLimit(id);
    if (!allowed) {
      return new NextResponse(
        "Too many attempts. Please try again in a minute.",
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
