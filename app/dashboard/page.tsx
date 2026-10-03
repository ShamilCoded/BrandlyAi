'use client';

/**
 * DIRECT ROUTE: /dashboard
 * Direct navigation to the Brandly.ai Workspace (Business or Creator view based on active role)
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/context/app-state-context';
import { BusinessWorkspace } from '@/components/dashboard/business-workspace';
import { CreatorDashboard } from '@/components/dashboard/creator-dashboard';

export default function DashboardRoutePage() {
  const router = useRouter();
  const { userRole, setUserRole } = useAppState();

  if (userRole === 'creator') {
    return (
      <CreatorDashboard
        onBackToLanding={() => router.push('/')}
        onSwitchToBusiness={() => setUserRole('business')}
        initialTab="dashboard"
      />
    );
  }

  return (
    <BusinessWorkspace
      onBackToLanding={() => router.push('/')}
      onSwitchToCreator={() => setUserRole('creator')}
      initialTab="overview"
    />
  );
}
