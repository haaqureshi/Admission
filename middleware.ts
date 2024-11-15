import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    // Check if the request is for the login page
    const isLoginPage = request.nextUrl.pathname === '/login';
    const isAuthCallback = request.nextUrl.pathname === '/auth/callback';
    
    // If user is not authenticated and trying to access protected routes
    if (!session && !isLoginPage && !isAuthCallback) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user is authenticated and trying to access login page
    if (session && isLoginPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware auth error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',],
};