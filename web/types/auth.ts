export type UserRole = 'operator' | 'administrator' | 'admin';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  fullName?: string;
  createdAt: number;
  lastLogin: number;
}

export interface AuthState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
} 