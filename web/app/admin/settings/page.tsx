'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SignupDialog } from '@/components/signup-dialog';
import { ref, get, remove, update, push, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Pencil } from 'lucide-react';

// Types
type UserData = {
  uid: string;
  email: string;
  fullName?: string;
  role: string;
  createdAt: number;
  lastLogin: number;
  isDirectCreated?: boolean;
};

type LogEntry = {
  timestamp: string;
  description: string;
};

export default function AdminSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [newLog, setNewLog] = useState('');
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDeleting, setIsDeleting] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [systemUptime, setSystemUptime] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [laserPower, setLaserPower] = useState<number>(0);

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

  const fetchLogs = () => {
    const logsRef = ref(db, 'maintenance_logs');
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedLogs = Object.values(data) as LogEntry[];
        setLogs(formattedLogs.reverse());
      } else {
        setLogs([]);
      }
    });
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchLogs();
    }
  }, [user, fetchUsers]);

  useEffect(() => {
    const todayKey = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    const interval = setInterval(() => {
      const uptimeRef = ref(db, `report/${todayKey}/system_uptime`);
      get(uptimeRef).then(snapshot => {
        if (snapshot.exists()) {
          setSystemUptime(snapshot.val());
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveSettings = async () => {
    const controlRef = ref(db, 'control/laser');
    await update(controlRef, { power: laserPower });
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await remove(ref(db, `users/${userToDelete.uid}`));
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

  const confirmEdit = (userData: UserData) => {
    setEditUser(userData);
    setEditName(userData.fullName || '');
    setEditRole(userData.role);
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      await update(ref(db, `users/${editUser.uid}`), {
        fullName: editName,
        role: editRole,
      });
      await fetchUsers();
      setShowEditDialog(false);
    } catch (err) {
      console.error('Edit failed', err);
    }
  };

  const handleAddLog = async () => {
    if (!newLog.trim()) return;
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const logRef = ref(db, 'maintenance_logs');
    await push(logRef, {
      timestamp,
      description: newLog.trim()
    });
    setShowLogDialog(false);
    setNewLog('');
  };

  if (!isLoaded || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">System Administration</h1>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* System Overview */}
          <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            <div className="flex justify-center items-center mb-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-secondary-foreground">
                  {systemUptime !== null ? `${systemUptime}%` : 'Loading...'}
                </div>
                <div className="text-sm text-gray-500">System Uptime</div>
              </div>
              <div className="mx-12"></div>
              <div className="text-center">
                <div className="text-6xl font-bold text-secondary-foreground">{users.length}</div>
                <div className="text-sm text-gray-500">{users.length === 1 ? 'User' : 'Users'}</div>
              </div>
            </div>
          </div>

          {/* Maintenance Log */}
          <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Maintenance Log</h2>
            <div className="space-y-3 mb-4">
              {logs.map((log, index) => (
                <div key={index} className="p-2 bg-secondary rounded">
                  <span className="text-secondary-foreground">{log.timestamp} - {log.description}</span>
                </div>
              ))}
            </div>
            <Button className="w-full bg-slate-700 hover:bg-slate-800" onClick={() => setShowLogDialog(true)}>Add Log Entry</Button>
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
                      <span className="text-gray-500 text-sm ml-2">({userData.email})</span>
                      <div className="text-xs text-gray-400">Role: {userData.role}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => confirmEdit(userData)}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button className="bg-red-500 hover:bg-red-600" onClick={() => confirmDelete(userData)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center">No users found</div>
              )}
            </div>
            <SignupDialog onUserAdded={fetchUsers} />
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
                <select className="w-full p-2 border rounded appearance-none bg-muted/50">
                  <option>Automatic</option>
                  <option>Manual</option>
                  <option>Diagnostic</option>
                </select>
              </div>
              <Button className="w-full bg-slate-700 hover:bg-slate-800">Save Settings</Button>
              <Button className="w-full bg-red-500 hover:bg-red-600">Restart System</Button>
            </div>
          </div>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label>Full Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <label>Role</label>
                <select className="w-full p-2 border rounded" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm User Deletion</DialogTitle>
              <DialogDescription>Are you sure you want to delete this user?</DialogDescription>
            </DialogHeader>
            {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600" onClick={handleDeleteUser}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Log Entry Dialog */}
        <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Maintenance Log</DialogTitle>
            </DialogHeader>
            <div>
              <label>Log Description</label>
              <Input value={newLog} onChange={(e) => setNewLog(e.target.value)} placeholder="Describe the maintenance..." />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogDialog(false)}>Cancel</Button>
              <Button onClick={handleAddLog}>Add Log</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}