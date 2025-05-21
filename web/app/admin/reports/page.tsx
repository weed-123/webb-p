'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import DailyReport from '@/components/reports/DailyReport';
import SystemStatusReport from '@/components/reports/SystemStatusReport';
import PerformanceDataExport from '@/components/reports/PerformanceDataExport';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminReports() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (user && user.role !== 'administrator' && user.role !== 'admin') {
      router.replace('/operator/dashboard');
    }
  }, [user, router]);

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="grid gap-10 grid-cols-1 xl:grid-cols-3">
        <DailyReport />
        <SystemStatusReport />
        <PerformanceDataExport />
      </div>
    </DashboardLayout>
  );
} 