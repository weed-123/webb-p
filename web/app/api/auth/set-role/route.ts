import { NextResponse } from 'next/server';
import { getUserRole } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();
    console.log('Setting role for user UID:', uid);
    
    const role = await getUserRole(uid);
    console.log('Retrieved role from database:', role);

    if (!role) {
      console.error('No role found for user:', uid);
      return NextResponse.json(
        { error: 'Failed to get user role' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true, role });
    
    response.cookies.set({
      name: 'user-role',
      value: role,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('Role cookie set successfully for:', role);
    return response;
  } catch (error) {
    console.error('Set role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 