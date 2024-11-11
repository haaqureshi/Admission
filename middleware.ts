import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isDashboardPage = request.nextUrl.pathname === '/dashboard';
  const isHomePage = request.nextUrl.pathname === '/';
  const user = request.cookies.get('user');

  // If user is not logged in and trying to access protected routes
  if (!user && (isDashboardPage)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and trying to access login page
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If accessing home page, redirect based on auth status
  if (isHomePage) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};