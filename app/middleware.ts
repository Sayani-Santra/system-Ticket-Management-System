import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('appwrite-session');
  const { pathname } = request.nextUrl;

  // Protect ticket routes
  if (!session?.value && pathname.startsWith('/tickets')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Prevent logged-in users from seeing the login page again
  if (session?.value && pathname === '/login') {
    return NextResponse.redirect(new URL('/tickets', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tickets/:path*', '/login'],
};