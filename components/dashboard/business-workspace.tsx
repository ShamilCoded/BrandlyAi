'use client';

/**
 * MODULE 4 — BUSINESS DASHBOARD & WORKSPACE
 * Features:
 * - Topbar with Business Switcher (SpaceWise, Chai Junction, Silk & Saffron, GlowCraft)
 * - Navigation: Overview, Campaigns, Find Creators, Recommendations, Compare, Proposals, Profile
 * - Integration with:
 *   - CampaignCreationWizard (Module 5)
 *   - RecommendationView (Module 10)
 *   - CreatorProfileView (Module 11)
 *   - CreatorComparisonView (Module 12)
 *   - Send Proposal Modal (Module 13)
 * - Deterministic creator filtering and search
 * - Clear Demo Data labeling & reset functionality
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Megaphone,
  Users,
  Send,
  Scale,
  Building,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  MapPin,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  Layers,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useAppState } from '@/lib/context/app-state-context';
import { DEMO_BUSINESSES } from '@/lib/seed/demo-dataset';
import {
  NICHE_CATEGORIES,
  PAKISTANI_CITIES,
  CREATOR_TYPES,
  SOCIAL_PLATFORMS,
  DELIVERABLE_TYPES,
} from '@/lib/config/constants';
import type {
  Creator,
  Campaign,
  Proposal,
  CreatorType,
  PakistaniCity,
  NicheCategory,
  SocialPlatform,
  DeliverableType,
  ProposalStatus,
} from '@/lib/types/domain';
import { CampaignCreationWizard } from '@/components/campaigns/campaign-creation-wizard';
import { CreatorProfileView } from '@/components/creators/creator-profile-view';
import { CreatorComparisonView } from '@/components/creators/creator-comparison-view';
import { RecommendationView } from '@/components/recommendations/recommendation-view';
import { DemoTourModal } from '@/components/demo/demo-tour-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { RegisterBusinessModal } from '@/components/registration/register-business-modal';

type ActiveTab =
  | 'overview'
  | 'campaigns'
  | 'creators'
  | 'recommendations'
  | 'compare'
  | 'proposals'
  | 'profile';

interface BusinessWorkspaceProps {
  onBackToLanding?: () => void;
  onSwitchToCreator?: () => void;
  initialTab?: ActiveTab;
}

export function BusinessWorkspace({
  onBackToLanding,
  onSwitchToCreator,
  initialTab = 'overview',
}: BusinessWorkspaceProps) {
  const {
    isLoading,
    error,
    businesses,
    activeBusiness,
    setActiveBusinessId,
    creators,
    packages,
    businessCampaigns,
    businessRecommendations,
    businessProposals,
    refreshMarketplace,
    saveCampaign,
    createProposal,
    updateProposalStatus,
    updateBusinessProfile,
  } = useAppState();

  const effectiveBusinesses = businesses && businesses.length > 0 ? businesses : DEMO_BUSINESSES;
  const effectiveActiveBusiness = activeBusiness || effectiveBusinesses[0];

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isRegisterBusinessOpen, setIsRegisterBusinessOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [selectedCreatorIdForProfile, setSelectedCreatorIdForProfile] = useState<string | null>(null);
  const [comparedCreatorIds, setComparedCreatorIds] = useState<string[]>([]);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [targetCreatorForProposal, setTargetCreatorForProposal] = useState<Creator | null>(null);
  const [targetCampaignIdForProposal, setTargetCampaignIdForProposal] = useState<string>('');

  // Proposal form state
  const [proposalBudget, setProposalBudget] = useState<number>(30000);
  const [proposalTimeline, setProposalTimeline] = useState<number>(7);
  const [proposalMessage, setProposalMessage] = useState<string>('');
  const [proposalDeliverables, setProposalDeliverables] = useState<DeliverableType[]>([
    'Reel',
  ]);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Creator filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreatorType, setSelectedCreatorType] = useState<string>('all');
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Business Profile Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: effectiveActiveBusiness?.name || '',
    category: effectiveActiveBusiness?.category || '',
    headquarters: effectiveActiveBusiness?.headquarters || ('Karachi' as PakistaniCity),
    website: effectiveActiveBusiness?.website || '',
    description: effectiveActiveBusiness?.description || '',
    contactPerson: effectiveActiveBusiness?.contactPerson || '',
  });

  // Sync profile form when active business changes
  useEffect(() => {
    if (effectiveActiveBusiness) {
      setProfileForm({
        name: effectiveActiveBusiness.name || '',
        category: effectiveActiveBusiness.category || '',
        headquarters: effectiveActiveBusiness.headquarters || ('Karachi' as PakistaniCity),
        website: effectiveActiveBusiness.website || '',
        description: effectiveActiveBusiness.description || '',
        contactPerson: effectiveActiveBusiness.contactPerson || '',
      });
    }
  }, [effectiveActiveBusiness]);

  // Keep target campaign for proposal modal in sync with business campaigns
  useEffect(() => {
    if (businessCampaigns.length > 0) {
      if (!businessCampaigns.some((c) => c.id === targetCampaignIdForProposal)) {
        setTargetCampaignIdForProposal(businessCampaigns[0].id);
      }
    } else {
      setTargetCampaignIdForProposal('');
    }
  }, [businessCampaigns, targetCampaignIdForProposal]);

  // Filtered creators list
  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesHandle = c.handle.toLowerCase().includes(q);
        const matchesNiche = c.primaryNiche.toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesNiche) return false;
      }
      if (selectedCreatorType !== 'all' && c.creatorType !== selectedCreatorType) return false;
      if (selectedNiche !== 'all' && c.primaryNiche !== selectedNiche) return false;
      if (selectedCity !== 'all' && c.location !== selectedCity) return false;
      if (
        selectedPlatform !== 'all' &&
        !c.platforms.includes(selectedPlatform as SocialPlatform)
      ) {
        return false;
      }
      return true;
    });
  }, [creators, searchQuery, selectedCreatorType, selectedNiche, selectedCity, selectedPlatform]);

  const comparedCreators = useMemo(() => {
    return creators.filter((c) => comparedCreatorIds.includes(c.id));
  }, [creators, comparedCreatorIds]);

  const handleToggleCompare = (creatorId: string) => {
    setComparedCreatorIds((prev) => {
      if (prev.includes(creatorId)) {
        return prev.filter((id) => id !== creatorId);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 creators simultaneously.');
        return prev;
      }
      return [...prev, creatorId];
    });
  };

  const handleOpenProposal = (creator: Creator, campaignId?: string) => {
    setTargetCreatorForProposal(creator);
    setTargetCampaignIdForProposal(campaignId || businessCampaigns[0]?.id || '');
    setProposalBudget(creator.startingRatePKR || 30000);
    setProposalMessage(
      `Hi ${creator.name}, we love your content and would like to collaborate on an upcoming campaign.`
    );
    setIsProposalModalOpen(true);
  };

  const handleSendProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCreatorForProposal || !effectiveActiveBusiness) return;
    setIsSubmittingProposal(true);
    try {
      const camp = businessCampaigns.find((c) => c.id === targetCampaignIdForProposal);
      await createProposal({
        campaignId: targetCampaignIdForProposal || 'direct',
        campaignTitle: camp?.title || 'Direct Brand Collaboration',
        businessId: effectiveActiveBusiness.id,
        businessName: effectiveActiveBusiness.name,
        creatorId: targetCreatorForProposal.id,
        creatorName: targetCreatorForProposal.name,
        creatorType: targetCreatorForProposal.creatorType,
        proposedDeliverables: proposalDeliverables,
        offeredBudgetPKR: proposalBudget,
        currency: 'PKR',
        timelineDays: proposalTimeline,
        status: 'pending',
        message: proposalMessage,
      });
      setIsProposalModalOpen(false);
      setActiveTab('proposals');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send proposal');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;
    await updateBusinessProfile(activeBusiness.id, profileForm);
    setIsEditingProfile(false);
  };

  if (isLoading && !activeBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm font-medium text-slate-400">Loading Brandly.ai Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Workspace Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-white font-['Syne',sans-serif]">
              Brandly<span className="text-indigo-400">.ai</span>
            </span>
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-800" />

          {/* Active Business Switcher */}
          <div className="relative flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300 hidden md:inline">Business:</span>
            <select
              value={effectiveActiveBusiness?.id || ''}
              onChange={(e) => {
                if (e.target.value === '__register_new__') {
                  setIsRegisterBusinessOpen(true);
                  return;
                }
                setActiveBusinessId(e.target.value);
              }}
              aria-label="Active Business Selector"
              className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-sm font-semibold text-white px-3.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {effectiveBusinesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category})
                </option>
              ))}
              <option value="__register_new__">+ Register New Business...</option>
            </select>
            <button
              type="button"
              onClick={() => setIsRegisterBusinessOpen(true)}
              title="Register a new business"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Building className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">+ Register Business</span>
            </button>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300">
              Demo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsTourOpen(true)}
            className="px-3.5 py-2 text-sm font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Judge Demo Tour</span>
          </button>

          {onSwitchToCreator && (
            <button
              type="button"
              onClick={onSwitchToCreator}
              className="px-3.5 py-2 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Creator View (Shamil)</span>
              <ArrowRight className="w-4 h-4 text-violet-400" />
            </button>
          )}

          <button
            type="button"
            onClick={() => refreshMarketplace(true)}
            title="Reset to fresh demo data"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo</span>
          </button>

          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="px-3.5 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Home
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-8 flex items-center gap-1.5 overflow-x-auto text-sm font-semibold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
            setSelectedCreatorIdForProfile(null);
          }}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'overview' && !selectedCreatorIdForProfile
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('campaigns');
            setSelectedCreatorIdForProfile(null);
          }}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'campaigns' && !selectedCreatorIdForProfile
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Campaigns ({businessCampaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('creators');
            setSelectedCreatorIdForProfile(null);
          }}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'creators' && !selectedCreatorIdForProfile
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Find Creators ({creators.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('recommendations');
            setSelectedCreatorIdForProfile(null);
          }}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'recommendations' && !selectedCreatorIdForProfile
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Matching</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('compare');
            setSelectedCreatorIdForProfile(null);
          }}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'compare' && !selectedCreatorIdForProfile
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Compare Creators ({comparedCreatorIds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('proposals');
            setSelectedCreatorIdForProfile(null);
          }}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'proposals' && !selectedCreatorIdForProfile
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Proposals ({businessProposals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('profile');
            setSelectedCreatorIdForProfile(null);
          }}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'profile' && !selectedCreatorIdForProfile
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Brand Profile</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 max-w-[1720px] mx-auto w-full">
        {/* Creator Profile View Overlay */}
        {selectedCreatorIdForProfile ? (
          <CreatorProfileView
            creatorId={selectedCreatorIdForProfile}
            onBack={() => setSelectedCreatorIdForProfile(null)}
            onOpenProposalModal={(c) => handleOpenProposal(c)}
            onToggleCompare={handleToggleCompare}
            isCompared={comparedCreatorIds.includes(selectedCreatorIdForProfile)}
          />
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Brand Welcome Banner */}
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Workspace Active
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-sm text-slate-300">{effectiveActiveBusiness?.headquarters}, Pakistan</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
                      Welcome back, {effectiveActiveBusiness?.name}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                      {effectiveActiveBusiness?.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsWizardOpen(true)}
                      className="px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Campaign</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('recommendations')}
                      className="px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>AI Recommendations</span>
                    </button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <span className="text-sm font-medium text-slate-300">Active Campaigns</span>
                    <div className="text-3xl font-extrabold text-white">
                      {businessCampaigns.filter((c) => c.status === 'active').length}
                    </div>
                    <span className="text-xs font-medium text-slate-400">{businessCampaigns.length} total</span>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <span className="text-sm font-medium text-slate-300">Total Vetted Creators</span>
                    <div className="text-3xl font-extrabold text-white">{creators.length}</div>
                    <span className="text-xs font-semibold text-emerald-400">Across 10 niches</span>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <span className="text-sm font-medium text-slate-300">AI Matches Generated</span>
                    <div className="text-3xl font-extrabold text-indigo-400">
                      {businessRecommendations.length}
                    </div>
                    <span className="text-xs font-medium text-slate-400">Multi-signal scored</span>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <span className="text-sm font-medium text-slate-300">Proposals Sent</span>
                    <div className="text-3xl font-extrabold text-white">{businessProposals.length}</div>
                    <span className="text-xs font-medium text-slate-400">
                      {businessProposals.filter((p) => p.status === 'accepted').length} accepted
                    </span>
                  </div>
                </div>

                {/* Recent Campaigns Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">Your Campaigns</h2>
                      <p className="text-sm text-slate-400">
                        Manage active briefs and launch AI matching.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('campaigns')}
                      className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {businessCampaigns.length === 0 ? (
                    <EmptyState
                      icon={Megaphone}
                      badge="Campaigns"
                      title="No Campaigns Created Yet"
                      description={`Create your first campaign for ${effectiveActiveBusiness?.name || 'this brand'} to define objectives, budget in PKR, and trigger AI matching.`}
                      action={{
                        label: 'Create Campaign',
                        onClick: () => setIsWizardOpen(true),
                        icon: Plus,
                      }}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {businessCampaigns.slice(0, 3).map((campaign) => (
                        <div
                          key={campaign.id}
                          className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                {campaign.category}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                                  campaign.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {campaign.status}
                              </span>
                            </div>
                            <h3 className="font-bold text-white text-lg leading-snug">
                              {campaign.title}
                            </h3>
                            <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                              {campaign.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-sm text-slate-300">
                            <div>
                              Budget: <span className="font-bold text-emerald-400">PKR {campaign.budget.toLocaleString()}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('recommendations');
                              }}
                              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>AI Matching</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Featured Creators Showcase */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">Featured Creator Spotlight</h2>
                      <p className="text-sm text-slate-400">
                        Vetted Pakistani creators across tech, lifestyle, food, and fashion.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('creators')}
                      className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore All {creators.length}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {creators.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-white text-base">{c.name}</h4>
                              <p className="text-sm text-slate-400">{c.handle}</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                              {c.creatorType}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{c.location}</span>
                            <span>•</span>
                            <span className="text-indigo-400 font-semibold">{c.primaryNiche}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                            <div>
                              <span className="text-slate-400 block text-xs">Followers</span>
                              <span className="font-bold text-white text-sm">
                                {c.followers > 0 ? c.followers.toLocaleString() : 'UGC Portfolio'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-xs">Starting Rate</span>
                              <span className="font-bold text-emerald-400 text-sm">
                                PKR {c.startingRatePKR.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => setSelectedCreatorIdForProfile(c.id)}
                            className="flex-1 py-2 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-center cursor-pointer transition-colors"
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenProposal(c)}
                            className="px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
                            title="Send Proposal"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white font-['Syne',sans-serif]">
                      Campaign Management
                    </h1>
                    <p className="text-sm text-slate-400">
                      Campaigns created by {activeBusiness?.name}. Click a campaign to run AI matching.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(true)}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Campaign</span>
                  </button>
                </div>

                {businessCampaigns.length === 0 ? (
                  <EmptyState
                    icon={Megaphone}
                    badge="Campaigns"
                    title="No Campaigns Created Yet"
                    description="Create your first campaign to define goals, budget in PKR, target audience, deliverables, and trigger AI matching."
                    action={{
                      label: 'Create Campaign',
                      onClick: () => setIsWizardOpen(true),
                      icon: Plus,
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {businessCampaigns.map((camp) => (
                      <div
                        key={camp.id}
                        className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-semibold text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                {camp.category}
                              </span>
                              <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {camp.status}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-white">{camp.title}</h3>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block">Total Budget</span>
                            <span className="text-base font-bold text-emerald-400">
                              PKR {camp.budget.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed">{camp.description}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2.5 text-sm bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                          <div>
                            <span className="text-xs text-slate-400 uppercase block font-medium">Platforms</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{camp.platforms.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 uppercase block font-medium">Creator Type</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">
                              {camp.creatorTypes.join(', ')}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 uppercase block font-medium">Deliverables</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">
                              {camp.deliverables.slice(0, 2).join(', ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                          <span className="text-xs text-slate-400">
                            Targets: <span className="text-slate-300 font-medium">{camp.targetLocations.join(', ')}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('recommendations');
                            }}
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Find Matching Creators</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CREATORS DIRECTORY TAB */}
            {activeTab === 'creators' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white font-['Syne',sans-serif]">
                      Pakistani Creator Directory
                    </h1>
                    <p className="text-sm text-slate-400">
                      Deterministic filtering across {creators.length} verified demo profiles. Compare up to 3 creators.
                    </p>
                  </div>
                  {comparedCreatorIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('compare')}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Compare ({comparedCreatorIds.length}/3)</span>
                    </button>
                  )}
                </div>

                {/* Filter Controls Bar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name, handle, or niche..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 pl-10 pr-3.5 py-2 text-sm rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <select
                      value={selectedCreatorType}
                      onChange={(e) => setSelectedCreatorType(e.target.value)}
                      aria-label="Filter by Creator Type"
                      className="bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Creator Types</option>
                      {CREATOR_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedNiche}
                      onChange={(e) => setSelectedNiche(e.target.value)}
                      aria-label="Filter by Niche"
                      className="bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Niches</option>
                      {NICICE_MAP(NICHE_CATEGORIES)}
                    </select>

                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      aria-label="Filter by City"
                      className="bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Pakistani Cities</option>
                      {PAKISTANI_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      aria-label="Filter by Social Platform"
                      className="bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Platforms</option>
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Creators Grid */}
                {filteredCreators.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    badge="Directory"
                    title="No Creators Match Current Filters"
                    description="Try adjusting your search keyword, creator type, city, or platform filters to find matching profiles."
                    action={{
                      label: 'Reset Filters',
                      onClick: () => {
                        setSearchQuery('');
                        setSelectedCreatorType('all');
                        setSelectedNiche('all');
                        setSelectedCity('all');
                        setSelectedPlatform('all');
                      },
                      icon: RefreshCw,
                      variant: 'secondary',
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredCreators.map((c) => {
                    const isCompared = comparedCreatorIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white text-lg">{c.name}</h3>
                                {c.isDemo && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                                    Demo
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-400">{c.handle}</p>
                            </div>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                c.creatorType === 'Influencer'
                                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                  : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                              }`}
                            >
                              {c.creatorType}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{c.location}</span>
                            <span>•</span>
                            <span className="text-indigo-400 font-semibold">{c.primaryNiche}</span>
                          </div>

                          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{c.bio}</p>

                          <div className="grid grid-cols-3 gap-2 py-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-center">
                            <div>
                              <span className="text-xs text-slate-400 block font-medium">Followers</span>
                              <span className="font-bold text-white text-sm block mt-0.5">
                                {c.followers > 0 ? c.followers.toLocaleString() : 'N/A (UGC)'}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 block font-medium">Engagement</span>
                              <span className="font-bold text-indigo-400 text-sm block mt-0.5">
                                {c.engagementRate > 0 ? `${c.engagementRate}%` : 'High'}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 block font-medium">From Rate</span>
                              <span className="font-bold text-emerald-400 text-sm block mt-0.5">
                                PKR {c.startingRatePKR.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedCreatorIdForProfile(c.id)}
                              className="flex-1 py-2 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-center cursor-pointer transition-colors"
                            >
                              View Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleCompare(c.id)}
                              className={`px-3.5 py-2 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                                isCompared
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-800 text-slate-300 hover:text-white'
                              }`}
                              title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
                            >
                              <Scale className="w-4 h-4" />
                              <span>{isCompared ? 'Compared' : 'Compare Creators'}</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenProposal(c)}
                            className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                          >
                            <Send className="w-4 h-4" />
                            <span>Send Proposal</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

            {/* RECOMMENDATIONS TAB */}
            {activeTab === 'recommendations' && (
              <RecommendationView
                onViewCreatorProfile={(id) => setSelectedCreatorIdForProfile(id)}
                onOpenProposalModal={(c, campId) => handleOpenProposal(c, campId)}
                onToggleCompare={handleToggleCompare}
                comparedCreatorIds={comparedCreatorIds}
                onCreateCampaign={() => setIsWizardOpen(true)}
              />
            )}

            {/* COMPARE TAB */}
            {activeTab === 'compare' && (
              <CreatorComparisonView
                creatorsToCompare={comparedCreators}
                packages={packages}
                recommendations={businessRecommendations}
                onRemoveCreator={handleToggleCompare}
                onClearAll={() => setComparedCreatorIds([])}
                onViewProfile={(id) => setSelectedCreatorIdForProfile(id)}
                onOpenProposal={(c) => handleOpenProposal(c)}
                onBack={() => setActiveTab('creators')}
              />
            )}

            {/* PROPOSALS TAB */}
            {activeTab === 'proposals' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-white font-['Syne',sans-serif]">
                    Proposals & Collaboration Requests
                  </h1>
                  <p className="text-xs text-slate-400">
                    Proposals submitted by {activeBusiness?.name} to creators.
                  </p>
                </div>

                {businessProposals.length === 0 ? (
                  <EmptyState
                    icon={Send}
                    badge="Collaborations"
                    title="No Proposals Sent Yet"
                    description="Explore relevant creators in the directory or run AI Matching to send targeted collaboration proposals."
                    action={{
                      label: 'Browse Creators',
                      onClick: () => setActiveTab('creators'),
                      icon: Users,
                    }}
                    secondaryAction={{
                      label: 'AI Matching',
                      onClick: () => setActiveTab('recommendations'),
                      icon: Sparkles,
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    {businessProposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-lg">{prop.creatorName}</h4>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {prop.creatorType}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                                prop.status === 'accepted'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : prop.status === 'declined'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {prop.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">
                            Campaign: <span className="text-white font-medium">{prop.campaignTitle}</span>
                          </p>
                          <p className="text-sm text-slate-400">
                            Deliverables: {prop.proposedDeliverables.join(', ')} • Timeline:{' '}
                            {prop.timelineDays} days
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block font-medium">Offer Amount</span>
                            <span className="text-base font-bold text-emerald-400">
                              PKR {prop.offeredBudgetPKR.toLocaleString()}
                            </span>
                          </div>

                          {/* Quick Demo status toggle */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateProposalStatus(prop.id, 'accepted')}
                              title="Mark Accepted (Demo simulation)"
                              className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => updateProposalStatus(prop.id, 'declined')}
                              title="Mark Declined (Demo simulation)"
                              className="px-3 py-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BRAND PROFILE TAB */}
            {activeTab === 'profile' && activeBusiness && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white font-['Syne',sans-serif]">
                      Brand Profile Settings
                    </h1>
                    <p className="text-sm text-slate-400">
                      Manage your business credentials and public verification details.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (effectiveActiveBusiness) {
                        setProfileForm({
                          name: effectiveActiveBusiness.name,
                          category: effectiveActiveBusiness.category,
                          headquarters: effectiveActiveBusiness.headquarters,
                          website: effectiveActiveBusiness.website || '',
                          description: effectiveActiveBusiness.description || '',
                          contactPerson: effectiveActiveBusiness.contactPerson || '',
                        });
                      }
                      setIsEditingProfile(!isEditingProfile);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                  >
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form
                    onSubmit={handleSaveProfile}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Brand Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300">Category</label>
                        <input
                          type="text"
                          value={profileForm.category}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, category: e.target.value }))
                          }
                          className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300">Headquarters</label>
                        <select
                          value={profileForm.headquarters}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              headquarters: e.target.value as PakistaniCity,
                            }))
                          }
                          className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                        >
                          {PAKISTANI_CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Website</label>
                      <input
                        type="url"
                        value={profileForm.website}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, website: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Contact Person</label>
                      <input
                        type="text"
                        value={profileForm.contactPerson}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, contactPerson: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Description</label>
                      <textarea
                        rows={3}
                        value={profileForm.description}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
                    >
                      Save Profile
                    </button>
                  </form>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-lg">
                        {effectiveActiveBusiness?.name.slice(0, 2).toUpperCase() || 'BZ'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{effectiveActiveBusiness?.name}</h3>
                        <p className="text-sm text-slate-300">
                          {effectiveActiveBusiness?.category} • {effectiveActiveBusiness?.headquarters}, Pakistan
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {effectiveActiveBusiness?.description}
                    </p>

                    <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400 block text-xs">Website</span>
                        <span className="text-slate-200 font-medium">{effectiveActiveBusiness?.website || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Contact</span>
                        <span className="text-slate-200 font-medium">{effectiveActiveBusiness?.contactPerson || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Guided Campaign Creation Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <CampaignCreationWizard
              activeBusiness={effectiveActiveBusiness}
              onSaveComplete={async (savedCamp, navigateToRecommendations) => {
                try {
                  await saveCampaign(savedCamp);
                } catch (err) {
                  console.warn('[Brandly.ai] Campaign save note:', err);
                }
                setIsWizardOpen(false);
                if (navigateToRecommendations) {
                  setActiveTab('recommendations');
                } else {
                  setActiveTab('campaigns');
                }
              }}
              onCancel={() => setIsWizardOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Send Proposal Modal */}
      {isProposalModalOpen && targetCreatorForProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Send Campaign Proposal</h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  To: <span className="text-white font-medium">{targetCreatorForProposal.name}</span> (
                  {targetCreatorForProposal.creatorType})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProposalModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendProposalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Select Campaign</label>
                <select
                  value={targetCampaignIdForProposal}
                  onChange={(e) => setTargetCampaignIdForProposal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                >
                  {businessCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (PKR {c.budget.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Offer Budget (PKR)</label>
                  <input
                    type="number"
                    value={proposalBudget}
                    onChange={(e) => setProposalBudget(Number(e.target.value))}
                    min={5000}
                    step={1000}
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Timeline (Days)</label>
                  <input
                    type="number"
                    value={proposalTimeline}
                    onChange={(e) => setProposalTimeline(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Collaboration Message</label>
                <textarea
                  rows={4}
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  placeholder="Describe your brief, timeline expectations, and deliverables..."
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingProposal ? 'Sending...' : 'Send Proposal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Demo Tour & Judge Walkthrough Modal */}
      <DemoTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateToTab={(tab) => {
          setActiveTab(tab as any);
          setSelectedCreatorIdForProfile(null);
        }}
      />

      {/* Register Business Modal */}
      <RegisterBusinessModal
        isOpen={isRegisterBusinessOpen}
        onClose={() => setIsRegisterBusinessOpen(false)}
        onSuccess={(bizId) => {
          setActiveBusinessId(bizId);
          setIsRegisterBusinessOpen(false);
        }}
      />
    </div>
  );
}

function NICICE_MAP(niches: readonly NicheCategory[]) {
  return niches.map((n) => (
    <option key={n} value={n}>
      {n}
    </option>
  ));
}
