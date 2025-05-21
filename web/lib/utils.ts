import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ref, get } from 'firebase/database';
import { db } from './firebase';
import { UserRole, UserData } from '@/types/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    const userData = snapshot.val() as UserData;
    return userData?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}
