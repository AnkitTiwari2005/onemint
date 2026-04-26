import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'onemint_admin_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect admin routes (not the login page or API auth routes)
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (pathname === '/admin/login') return NextResponse.next();
  if (pathname.startsWith('/api/admin/auth')) return NextResponse.next();

  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (session !== 'authenticated') {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
