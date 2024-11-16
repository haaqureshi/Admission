import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = request.nextUrl.pathname === '/login';
  const isPublicPage = request.nextUrl.pathname === '/';

  // If user is not authenticated and trying to access protected routes
  if (!session && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated but trying to access auth pages
  if (session && (isAuthPage || isPublicPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is authenticated but doesn't have bsolpk.org email
  if (session && !session.user.email?.endsWith('@bsolpk.org')) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};