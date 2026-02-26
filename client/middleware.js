import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Protected routes
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAgronmistRoute = pathname.startsWith('/expert');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isDashboardRoute || isAgronmistRoute || isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Mock Role-Based Access Control
  const user = request.cookies.get('user-role'); // Usually decoded from JWT
  const role = user?.value;

  if (isAgronmistRoute && role !== 'Agronomist' && role !== 'Admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (isAdminRoute && role !== 'Admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/expert/:path*', '/admin/:path*'],
};
