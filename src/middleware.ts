import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for certain paths
  const skipPaths = [
    "/api",
    "/_next",
    "/favicon.ico",
    "/complete-profile",
    "/auth",
  ];

  if (skipPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if user has a session token (basic check)
  const sessionToken =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");


  // If no session token, let them continue (they'll be redirected by your app logic)
  if (!sessionToken) {
    return NextResponse.next();
  }

  // For authenticated users, we'll check phone completion in the page components
  // This avoids the edge runtime issues with database queries
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
