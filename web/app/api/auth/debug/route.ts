import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract cookies
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        cookies[parts[0]] = parts[1];
      }
    });
    
    // Check for auth token and role
    const hasToken = 'firebase-token' in cookies;
    const role = cookies['user-role'] || null;
    
    // Return all debug information
    return NextResponse.json({
      cookies,
      auth: {
        hasToken,
        role,
        isAuthenticated: hasToken && !!role
      },
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', errorDetails: String(error) },
      { status: 500 }
    );
  }
} 