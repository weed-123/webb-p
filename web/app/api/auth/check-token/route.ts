import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    console.log('Check-token - Cookie header:', cookieHeader);
    
    const hasToken = cookieHeader.includes('firebase-token=');
    const userRoleCookie = cookieHeader.match(/user-role=([^;]+)/);
    const userRole = userRoleCookie ? userRoleCookie[1] : null;
    
    console.log('Check-token - Has token:', hasToken);
    console.log('Check-token - User role from cookie:', userRole);

    if (!hasToken) {
      console.log('Check-token - No token found, returning unauthenticated');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Here you would typically verify the token with Firebase
    // For now, we'll just check if it exists and return role information
    console.log('Check-token - User is authenticated with role:', userRole);
    return NextResponse.json({ 
      authenticated: true,
      role: userRole
    });
    
  } catch (error) {
    console.error('Check token error:', error);
    return NextResponse.json(
      { error: 'Internal server error', authenticated: false },
      { status: 500 }
    );
  }
} 