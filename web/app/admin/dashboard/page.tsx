'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import RealtimeMonitor from '@/components/RealtimeMonitor';
import Control from '@/components/Control';
import Data from '@/components/Data';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="grid auto-rows-min gap-4 grid-cols-1 xl:grid-cols-3">
        <RealtimeMonitor />
        <Control />
        <Data />
      </div>
    </DashboardLayout>
  );
} 