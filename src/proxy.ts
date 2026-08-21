import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-fallback-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that do not require authentication
  const publicPaths = ['/login', '/_next', '/favicon.ico', '/api/auth/login'];
  
  if (publicPaths.some(p => pathname.startsWith(p)) || pathname === '/') {
    // If user is already logged in and tries to access login, redirect them
    if (pathname === '/login' && token) {
      try {
        await jwtVerify(token, key);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (err) {
        // Token invalid, let them proceed to login
      }
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, key);
    
    // Ensure dashboard directs to role-based dashboard if accessing generic /dashboard
    if (pathname === '/dashboard') {
      // Just a placeholder generic dashboard for now, could redirect based on role
      return NextResponse.next();
    }

    // RBAC: Example protecting /admin paths
    if (pathname.startsWith('/admin') && payload.role !== 'SUPER_ADMIN') {
      // In our current setup, we put schools/courses/etc under /(admin)
      // We will refine this routing later, but for now allow them if they are authenticated
      // to not break the UI while we migrate.
      // return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Pass the payload details to the headers so server components/actions can read them
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', payload.role as string);
    requestHeaders.set('x-user-id', payload.id as string);
    if (payload.schoolId) requestHeaders.set('x-user-school', payload.schoolId as string);
    if (payload.departmentId) requestHeaders.set('x-user-department', payload.departmentId as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Invalid token:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
