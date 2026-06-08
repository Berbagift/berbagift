import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Extract token from cookies using the exact key from lib/auth.ts
  const token = request.cookies.get('access_token')?.value;

  // Define paths that require a connected wallet/authenticated session
  const protectedPrefixes = [
    '/dashboard',
    '/sendthr',
    '/create-room',
    '/profile'
  ];
  
  // Check if current path matches any of the protected prefixes
  const isProtectedPath = protectedPrefixes.some((prefix) => 
    request.nextUrl.pathname.startsWith(prefix)
  );

  // Auto-redirect to landing page if unauthorized
  if (isProtectedPath && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Auto-redirect to dashboard if user is already authenticated and visits the root login/landing page
  if (request.nextUrl.pathname === '/' && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run middleware on all paths except for:
     * - api (API routes proxy)
     * - _next/static (Next.js static assets)
     * - _next/image (Next.js image optimization)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g., .png, .svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
