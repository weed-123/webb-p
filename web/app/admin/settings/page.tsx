'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SignupDialog } from '@/components/signup-dialog';
import { ref, get, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

type UserData = {
  uid: string;
  email: string;
  fullName?: string;
  role: string;
  createdAt: number;
  lastLogin: number;
  isDirectCreated?: boolean;
};

export default function AdminSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (user && user.role !== 'administrator' && user.role !== 'admin') {
      router.replace('/operator/dashboard');
    }
  }, [user, router]);

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      const usersArray = Object.values(usersData) as UserData[];
      setUsers(usersArray);
    } else {
      setUsers([]);
    }
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      if (userToDelete.isDirectCreated) {
        await remove(ref(db, `users/${userToDelete.uid}`));
      } else {
        const response = await fetch('/api/auth/delete-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: userToDelete.uid }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }
      }
      
      if (user && userToDelete.uid === user.uid) {
        alert("You've deleted your own account. You'll be logged out.");
        window.location.href = '/login';
        return;
      }
      
      await fetchUsers();
      
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeleteError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (userData: UserData) => {
    setUserToDelete(userData);
    setShowDeleteDialog(true);
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">System Administration</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">System Operational</span>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* System Overview */}
          <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            
            <div className="flex justify-center items-center mb-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-secondary-foreground">99.9%</div>
                <div className="text-sm text-gray-500">System Uptime</div>
              </div>
              <div className="mx-12"></div>
              <div className="text-center">
                <div className="text-6xl font-bold text-secondary-foreground">{users.length}</div>
                <div className="text-sm text-gray-500">{users.length === 1 ? 'User' : 'Users'}</div>
              </div>
            </div>
          </div>
          
          {/* User Management */}
          <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            
            <div className="space-y-3 mb-4">
              {loading ? (
                <div className="p-2 text-center">Loading users...</div>
              ) : users.length > 0 ? (
                users.map((userData) => (
                  <div key={userData.uid} className="flex justify-between items-center p-2 bg-secondary rounded">
                    <div className="overflow-hidden">
                      <span className="font-medium text-secondary-foreground">
                        {userData.fullName || 'No Name'}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        ({userData.email})
                      </span>
                      <div className="text-xs text-gray-400">
                        Role: {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                      </div>
                    </div>
                    <Button 
                      className="bg-red-500 hover:bg-red-600 border-0 h-8"
                      onClick={() => confirmDelete(userData)}
                      disabled={userData.uid === user.uid}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center">No users found</div>
              )}
            </div>
            
            <SignupDialog onUserAdded={fetchUsers} />
          </div>
          
          {/* Maintenance Log */}
          <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Maintenance Log</h2>
            
            <div className="space-y-3 mb-4">
              <div className="p-2 bg-secondary rounded">
                <span className="text-secondary-foreground">2024-12-05 14:30 - System calibration performed</span>
              </div>
              
              <div className="p-2 bg-secondary rounded">
                <span className="text-secondary-foreground">2024-12-05 10:15 - Laser system maintenance</span>
              </div>
            </div>
            
            <Button className="w-full bg-slate-700 hover:bg-slate-800 ">Add Log Entry</Button>
          </div>
          
          {/* System Settings */}
          <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-secondary-foreground mb-1">Laser Power Level (%)</label>
                <Input type="text" className="w-full" defaultValue="75" />
              </div>
              
              <div>
                <label className="block text-secondary-foreground mb-1">Operating Mode</label>
                <div className="relative">
                  <select className="w-full p-2 border rounded appearance-none bg-muted/50">
                    <option>Automatic</option>
                    <option>Manual</option>
                    <option>Diagnostic</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-slate-700 hover:bg-slate-800 ">Save Settings</Button>
              <Button className="w-full bg-red-500 hover:bg-red-600 ">Restart System</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {userToDelete && (
            <div className="py-4">
              <p><strong>Name:</strong> {userToDelete.fullName || 'No Name'}</p>
              <p><strong>Email:</strong> {userToDelete.email}</p>
              <p><strong>Role:</strong> {userToDelete.role}</p>
              <p><strong>Type:</strong> {userToDelete.isDirectCreated ? 'Manually Created' : 'Authentication User'}</p>
            </div>
          )}
          
          {deleteError && (
            <div className="text-sm text-red-500 mt-2">
              {deleteError}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              className="bg-red-500 hover:bg-red-600" 
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 