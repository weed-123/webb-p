'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import DailyReport from '@/components/reports/DailyReport';
import SystemStatusReport from '@/components/reports/SystemStatusReport';
import PerformanceDataExport from '@/components/reports/PerformanceDataExport';

export default function OperatorReports() {

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