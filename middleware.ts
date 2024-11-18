import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for /form route
  if (request.nextUrl.pathname === '/form') {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    const isAuthPage = request.nextUrl.pathname === '/login';
    const isPublicPage = request.nextUrl.pathname === '/';

    // If user is not authenticated and trying to access protected routes
    if (!session && !isAuthPage && !isPublicPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user is authenticated but trying to access auth pages
    if (session && (isAuthPage || request.nextUrl.pathname === '/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is authenticated but doesn't have bsolpk.org email
    if (session && !session.user.email?.endsWith('@bsolpk.org')) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return res;
  } catch (error) {
    // In case of any error, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - form (public form page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|form).*)',
  ],
};