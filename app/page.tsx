'use client';

/**
 * BRANDLY.AI — ROOT APPLICATION PAGE
 * Provides seamless transitions between:
 * - Module 1: Brand System & Public Landing Page
 * - Module 4 & 15: Business Workspace
 * - Module 14 & 15: Creator Dashboard (Shamil)
 * - Module 16: Two-Sided Marketplace & Hackathon Demo Mode
 */

import React, { useState } from 'react';
import { useAppState } from '@/lib/context/app-state-context';
import { LandingPage } from '@/components/landing/landing-page';
import { BusinessWorkspace } from '@/components/dashboard/business-workspace';
import { CreatorDashboard } from '@/components/dashboard/creator-dashboard';

export default function HomePage() {
  const { userRole, setUserRole } = useAppState();
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [initialTab, setInitialTab] = useState<
    'overview' | 'campaigns' | 'creators' | 'recommendations' | 'compare' | 'proposals' | 'profile'
  >('overview');

  if (viewMode === 'workspace') {
    if (userRole === 'creator') {
      return (
        <CreatorDashboard
          onBackToLanding={() => setViewMode('landing')}
          onSwitchToBusiness={() => setUserRole('business')}
          initialTab="dashboard"
        />
      );
    }

    return (
      <BusinessWorkspace
        onBackToLanding={() => setViewMode('landing')}
        onSwitchToCreator={() => setUserRole('creator')}
        initialTab={initialTab}
      />
    );
  }

  return (
    <LandingPage
      onStartDemo={() => {
        setUserRole('business');
        setInitialTab('overview');
        setViewMode('workspace');
      }}
      onExploreBusinesses={() => {
        setUserRole('business');
        setInitialTab('campaigns');
        setViewMode('workspace');
      }}
      onExploreCreators={() => {
        setUserRole('creator');
        setViewMode('workspace');
      }}
      onRegisterBusinessSuccess={() => {
        setUserRole('business');
        setInitialTab('overview');
        setViewMode('workspace');
      }}
      onRegisterCreatorSuccess={() => {
        setUserRole('creator');
        setViewMode('workspace');
      }}
    />
  );
}
