import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('firebase-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;
  const path = request.nextUrl.pathname;

  console.log('Middleware - Path:', path);
  console.log('Middleware - Auth Token exists:', !!authToken);
  console.log('Middleware - User Role:', userRole || 'None');

  // Check specifically for login path
  if (path === '/(auth)/login' || path === '/login') {
    console.log('Middleware - Login page detected');
    if (authToken && userRole) {
      console.log('Middleware - User already logged in, redirecting to dashboard');
      const isAdmin = userRole === 'administrator' || userRole === 'admin';
      const dashboardPath = isAdmin ? '/admin/dashboard' : '/operator/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    console.log('Middleware - Allowing login page access');
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  if (path.startsWith('/(auth)') || path === '/') {
    console.log('Middleware - Public route detected');
    if (authToken && userRole) {
      // If user is authenticated, redirect to their dashboard
      const isAdmin = userRole === 'administrator' || userRole === 'admin';
      const dashboardPath = isAdmin ? '/admin/dashboard' : '/operator/dashboard';
      console.log('Middleware - Authenticated user on public route, redirecting to:', dashboardPath);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    console.log('Middleware - Allowing public route access');
    return NextResponse.next();
  }

  // Protected routes
  if (!authToken || !userRole) {
    console.log('Middleware - No auth token or role, redirecting to login');
    return NextResponse.redirect(new URL('/(auth)/login', request.url));
  }

  // Role-based route protection
  const isAdmin = userRole === 'administrator' || userRole === 'admin';
  
  if (path.startsWith('/admin') && !isAdmin) {
    console.log('Middleware - User with role', userRole, 'attempting to access admin route');
    return NextResponse.redirect(new URL('/(auth)/login', request.url));
  }

  if (path.startsWith('/operator') && (isAdmin || userRole !== 'operator')) {
    console.log('Middleware - User with role', userRole, 'attempting to access operator route');
    if (isAdmin) {
      console.log('Middleware - Admin trying to access operator route, redirecting to admin dashboard');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/(auth)/login', request.url));
  }

  console.log('Middleware - Access granted to protected route');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/(auth)/:path*',
    '/login',
    '/admin/:path*',
    '/operator/:path*',
    '/api/auth/debug',
    '/',
  ],
}; 