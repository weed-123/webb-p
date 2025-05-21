"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { AuthState, UserData, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    const handleAuthChange = async (user: User | null) => {
      console.log('Auth state changed:', user ? 'User exists' : 'No user');
      
      if (user) {
        try {
          // Get the Firebase token
          const token = await user.getIdToken();
          console.log('Got Firebase token:', token.substring(0, 10) + '...');

          // Set the token cookie
          const tokenResponse = await fetch('/api/auth/set-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
            credentials: 'same-origin'
          });

          if (!tokenResponse.ok) {
            console.error('Failed to set auth token:', await tokenResponse.text());
            throw new Error('Failed to set auth token');
          }

          console.log('Auth token cookie set successfully');

          console.log('Fetching user data for:', user.uid);
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          const userData = snapshot.val() as UserData;

          if (!userData) {
            console.error('No user data found in database for UID:', user.uid);
            throw new Error('No user data found');
          }

          console.log('User data retrieved:', JSON.stringify(userData));

          // Update last login
          await set(ref(db, `users/${user.uid}/lastLogin`), Date.now());
          console.log('Last login updated');

          // Set user role in cookie
          console.log('Setting user role cookie for role:', userData.role);
          const response = await fetch('/api/auth/set-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid: user.uid }),
            credentials: 'same-origin'
          });

          const roleData = await response.json();
          console.log('Role API response:', JSON.stringify(roleData));

          if (!response.ok) {
            console.error('Failed to set role cookie:', await response.text());
            throw new Error('Failed to set user role');
          }

          console.log('Role cookie set successfully');

          setAuthState({
            user: userData,
            loading: false,
            error: null,
          });

          // Immediate redirection based on role
          const isAdmin = userData.role === 'administrator' || userData.role === 'admin';
          const targetPath = isAdmin ? '/admin/dashboard' : '/operator/dashboard';
          console.log('Redirecting to:', targetPath);
          
          // Add a slight delay to ensure cookies are set before redirection
          setTimeout(() => {
            router.replace(targetPath);
          }, 500);
          
        } catch (error) {
          console.error('Auth error:', error);
          setAuthState({
            user: null,
            loading: false,
            error: 'Failed to fetch user data',
          });
          router.replace('/login');
        }
      } else {
        console.log('No user, resetting auth state');
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
        router.replace('/login');
      }
    };

    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string): Promise<void> => {
    console.log('Attempting sign in for:', email);
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
      // The auth change handler will handle the rest
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        error.message === 'Firebase: Error (auth/invalid-credential).' 
          ? 'Invalid email or password'
          : error.message 
        : 'An unknown error occurred';
      
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      // Don't throw the error, just handle it locally
      return;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    console.log('Attempting sign up for:', email, 'with role:', role);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', user.uid);

      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        role,
        createdAt: Date.now(),
        lastLogin: Date.now(),
      };

      await set(ref(db, `users/${user.uid}`), userData);
      console.log('User data saved to database');
      // The auth change handler will handle the rest
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const logout = async () => {
    console.log('Attempting logout');
    try {
      // Clear cookies first
      const clearResponse = await fetch('/api/auth/clear-cookies', { 
        method: 'POST',
        credentials: 'same-origin'
      });

      if (!clearResponse.ok) {
        console.error('Failed to clear cookies:', await clearResponse.text());
        throw new Error('Failed to clear user cookies');
      }

      console.log('Cookies cleared');
      await signOut(auth);
      console.log('Signed out of Firebase');
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signUp,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 