import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: "https://weedout-online-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json();
    
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required user information' },
        { status: 400 }
      );
    }

    const auth = getAuth();
    const db = getDatabase();

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role });

    const userData = {
      uid: userRecord.uid,
      email,
      fullName,
      role,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      isAdminCreated: true
    };

    await db.ref(`users/${userRecord.uid}`).set(userData);

    return NextResponse.json({ 
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        fullName,
        role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 