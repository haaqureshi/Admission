import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isDashboardPage = request.nextUrl.pathname === '/dashboard';
  const isHomePage = request.nextUrl.pathname === '/';

  // If accessing home page, redirect to dashboard
  if (isHomePage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};