'use client';

/**
 * MODULE 14 — CREATOR DASHBOARD
 * Features:
 * - Navigation: Dashboard, Profile, Campaign Opportunities, Proposals, Packages, Settings
 * - Dashboard metrics:
 *   - Profile Completeness (Deterministic calculation)
 *   - Campaign Opportunities
 *   - Pending Proposals
 *   - Active Collaborations
 * - Campaign Opportunities list with business, campaign name, category, budget, platform, location, niche, deliverables, deadline
 * - Proposals inbox with Accept, Decline, and Request Negotiation workflows
 * - Packages management (edit/add custom packages)
 * - Clear "Demo Creator" banner and profile indicator (Defaults to Shamil)
 * - Uses shared Firestore / repository source of truth
 */

import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  User,
  Megaphone,
  Send,
  Package,
  Settings,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Video,
  DollarSign,
  FileText,
  Layers,
} from 'lucide-react';
import { useAppState } from '@/lib/context/app-state-context';
import {
  NICHE_CATEGORIES,
  PAKISTANI_CITIES,
  CREATOR_SERVICES,
  SUPPORTED_LANGUAGES,
  DELIVERABLE_TYPES,
} from '@/lib/config/constants';
import { EmptyState } from '@/components/ui/empty-state';
import type {
  Creator,
  CreatorPackage,
  Proposal,
  ProposalStatus,
  PakistaniCity,
  NicheCategory,
  CreatorServiceType,
  SupportedLanguage,
  DeliverableType,
} from '@/lib/types/domain';

type CreatorTab =
  | 'dashboard'
  | 'profile'
  | 'opportunities'
  | 'proposals'
  | 'packages'
  | 'settings';

interface CreatorDashboardProps {
  onBackToLanding?: () => void;
  onSwitchToBusiness?: () => void;
  initialTab?: CreatorTab;
}

export function CreatorDashboard({
  onBackToLanding,
  onSwitchToBusiness,
  initialTab = 'dashboard',
}: CreatorDashboardProps) {
  const {
    creators,
    activeCreator,
    setActiveCreatorId,
    creatorPackages,
    creatorProposals,
    creatorCampaignOpportunities,
    calculateProfileCompleteness,
    updateProposalStatus,
    updateCreatorProfile,
    saveCreatorPackage,
    deleteCreatorPackage,
    refreshMarketplace,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<CreatorTab>(initialTab);

  // Proposal detail & negotiation modal
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [negotiationNote, setNegotiationNote] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: activeCreator?.name || '',
    handle: activeCreator?.handle || '',
    bio: activeCreator?.bio || '',
    location: activeCreator?.location || ('Karachi' as PakistaniCity),
    primaryNiche: activeCreator?.primaryNiche || ('Technology' as NicheCategory),
    startingRatePKR: activeCreator?.startingRatePKR || 30000,
    turnaroundDays: activeCreator?.turnaroundDays || 5,
  });

  // Package Form State
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [packageForm, setPackageForm] = useState({
    title: '',
    pricePKR: 35000,
    timelineDays: 5,
    description: '',
    deliverables: ['Reel' as DeliverableType],
    revisions: 2,
  });

  const completeness = calculateProfileCompleteness(activeCreator);

  const pendingProposals = creatorProposals.filter(
    (p) => p.status === 'Pending' || p.status === 'pending'
  );
  const activeCollaborations = creatorProposals.filter(
    (p) => p.status === 'Accepted' || p.status === 'accepted'
  );

  const handleUpdateStatus = async (
    proposalId: string,
    newStatus: ProposalStatus,
    note?: string
  ) => {
    setIsSubmittingResponse(true);
    try {
      await updateProposalStatus(proposalId, newStatus, note);
      setSelectedProposal(null);
      setNegotiationNote('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update proposal status');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCreator) return;
    await updateCreatorProfile(activeCreator.id, profileForm);
    setIsEditingProfile(false);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCreator) return;
    await saveCreatorPackage({
      creatorId: activeCreator.id,
      creatorName: activeCreator.name,
      title: packageForm.title,
      platform: 'Instagram',
      pricePKR: packageForm.pricePKR,
      currency: 'PKR',
      deliveryDays: packageForm.timelineDays,
      deliverables: packageForm.deliverables,
      description: packageForm.description,
      revisionsIncluded: packageForm.revisions,
      usageRightsDays: 30,
    });
    setIsAddingPackage(false);
    setPackageForm({
      title: '',
      pricePKR: 35000,
      timelineDays: 5,
      description: '',
      deliverables: ['Reel'],
      revisions: 2,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Creator Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-violet-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-white font-['Syne',sans-serif]">
              Brandly<span className="text-indigo-400">.ai</span>
            </span>
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-800" />

          {/* Active Creator Persona Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300 hidden md:inline">Creator:</span>
            <select
              value={activeCreator?.id || ''}
              onChange={(e) => setActiveCreatorId(e.target.value)}
              aria-label="Active Creator Selector"
              className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-sm font-semibold text-white px-3.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.creatorType} • {c.location})
                </option>
              ))}
            </select>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              Demo Creator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onSwitchToBusiness && (
            <button
              type="button"
              onClick={onSwitchToBusiness}
              className="px-3.5 py-2 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Switch to Brand View</span>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </button>
          )}

          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="px-3.5 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Home
            </button>
          )}
        </div>
      </header>

      {/* Navigation Sub-Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-8 flex items-center gap-1.5 overflow-x-auto text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile ({completeness}%)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('opportunities')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'opportunities'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Campaign Opportunities ({creatorCampaignOpportunities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'proposals'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>
            Proposals ({creatorProposals.length})
            {pendingProposals.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-500 text-white font-bold">
                {pendingProposals.length}
              </span>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'packages'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Packages ({creatorPackages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 max-w-[1720px] mx-auto w-full">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Creator Welcome Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-slate-900 border border-violet-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                    Demo Creator Active
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-sm text-slate-300">
                    {activeCreator?.creatorType} • {activeCreator?.location}, Pakistan
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
                  Welcome back, {activeCreator?.name}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  {activeCreator?.bio}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('proposals')}
                  className="px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>View Proposals ({pendingProposals.length} Pending)</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Metric 1: Profile Completeness */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Profile Completeness</span>
                  <span className="text-sm font-bold text-indigo-400">{completeness}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 block">
                  Deterministic audit from stored fields
                </span>
              </div>

              {/* Metric 2: Campaign Opportunities */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-sm font-medium text-slate-300">Campaign Opportunities</span>
                <div className="text-3xl font-extrabold text-white">
                  {creatorCampaignOpportunities.length}
                </div>
                <span className="text-xs font-semibold text-emerald-400">Matching your niche & style</span>
              </div>

              {/* Metric 3: Pending Proposals */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-sm font-medium text-slate-300">Pending Proposals</span>
                <div className="text-3xl font-extrabold text-indigo-400">
                  {pendingProposals.length}
                </div>
                <span className="text-xs font-medium text-slate-400">Awaiting your response</span>
              </div>

              {/* Metric 4: Active Collaborations */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-sm font-medium text-slate-300">Active Collaborations</span>
                <div className="text-3xl font-extrabold text-white">
                  {activeCollaborations.length}
                </div>
                <span className="text-xs font-medium text-slate-400">Accepted partnerships</span>
              </div>
            </div>

            {/* Pending Proposals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Incoming Proposals</h2>
                  <p className="text-sm text-slate-400">
                    Brands that selected you via AI matching or direct inquiry.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('proposals')}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View All Proposals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {creatorProposals.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-400">
                  No proposals received yet. Brands discovering you via AI matching will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {creatorProposals.slice(0, 3).map((prop) => (
                    <div
                      key={prop.id}
                      className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-lg">{prop.businessName}</h4>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                              prop.status === 'Accepted' || prop.status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : prop.status === 'Declined' || prop.status === 'declined'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : prop.status === 'Negotiation'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">
                          Campaign: <span className="font-medium text-white">{prop.campaignTitle}</span>
                        </p>
                        <p className="text-sm text-slate-300 italic">
                          &quot;{prop.message}&quot;
                        </p>
                        <p className="text-xs text-slate-400">
                          Deliverables: {prop.proposedDeliverables.join(', ')} • Timeline:{' '}
                          {prop.timelineDays} days
                        </p>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-medium">Offer</span>
                          <span className="text-base font-bold text-emerald-400">
                            PKR {prop.offeredBudgetPKR.toLocaleString()}
                          </span>
                        </div>

                        {(prop.status === 'Pending' || prop.status === 'pending') && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(prop.id, 'Accepted')}
                              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProposal(prop);
                                setNegotiationNote(prop.creatorNote || '');
                              }}
                              className="px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg cursor-pointer transition-colors"
                            >
                              Negotiate
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(prop.id, 'Declined')}
                              className="px-3 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg cursor-pointer transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Opportunities Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Relevant Campaign Opportunities</h2>
                  <p className="text-sm text-slate-400">
                    Active brand briefs open for pitching or creator discovery.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('opportunities')}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View All Opportunities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creatorCampaignOpportunities.slice(0, 2).map((camp) => (
                  <div
                    key={camp.id}
                    className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          {camp.category}
                        </span>
                        <h4 className="font-bold text-white text-lg mt-1.5">{camp.title}</h4>
                        <p className="text-sm text-slate-300">By {camp.businessName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Budget</span>
                        <span className="text-base font-bold text-emerald-400">
                          PKR {camp.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{camp.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-sm text-slate-300">
                      <span>Targets: {camp.targetLocations.join(', ')}</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('opportunities')}
                        className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        View Brief →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && activeCreator && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white font-['Syne',sans-serif]">
                  Creator Profile
                </h1>
                <p className="text-sm text-slate-400">
                  Manage your public marketplace bio, rates, and niche specialization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileForm({
                    name: activeCreator.name,
                    handle: activeCreator.handle,
                    bio: activeCreator.bio,
                    location: activeCreator.location,
                    primaryNiche: activeCreator.primaryNiche,
                    startingRatePKR: activeCreator.startingRatePKR,
                    turnaroundDays: activeCreator.turnaroundDays,
                  });
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Completeness Checklist */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Profile Completeness Audit</span>
                <span className="text-sm font-bold text-indigo-400">{completeness}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Name & Handle (+15%)</span>
                </div>
                <div
                  className={`flex items-center gap-2 font-medium ${
                    activeCreator.bio.length >= 20 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Detailed Bio (+15%)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Location Verified (+10%)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Primary Niche (+10%)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Platforms Configured (+10%)</span>
                </div>
                <div
                  className={`flex items-center gap-2 font-medium ${
                    creatorPackages.length > 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Packages Listed (+10%)</span>
                </div>
              </div>
            </div>

            {isEditingProfile ? (
              <form
                onSubmit={handleSaveProfile}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Name</label>
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
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Handle</label>
                    <input
                      type="text"
                      value={profileForm.handle}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, handle: e.target.value }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">City</label>
                    <select
                      value={profileForm.location}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          location: e.target.value as PakistaniCity,
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

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Primary Niche</label>
                    <select
                      value={profileForm.primaryNiche}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          primaryNiche: e.target.value as NicheCategory,
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                    >
                      {NICHE_CATEGORIES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Starting Rate (PKR)</label>
                    <input
                      type="number"
                      value={profileForm.startingRatePKR}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          startingRatePKR: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Turnaround (Days)</label>
                    <input
                      type="number"
                      value={profileForm.turnaroundDays}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          turnaroundDays: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Bio & Production Focus</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {activeCreator.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">{activeCreator.name}</h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {activeCreator.creatorType}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      {activeCreator.handle} • {activeCreator.location}, Pakistan
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{activeCreator.bio}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-t border-slate-800 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Followers</span>
                    <span className="font-bold text-white text-base">
                      {activeCreator.followers > 0
                        ? activeCreator.followers.toLocaleString()
                        : 'UGC Specialist'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Avg Views</span>
                    <span className="font-bold text-white text-base">
                      {activeCreator.averageViews.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Engagement</span>
                    <span className="font-bold text-indigo-400 text-base">
                      {activeCreator.engagementRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Starting Rate</span>
                    <span className="font-bold text-emerald-400 text-base">
                      PKR {activeCreator.startingRatePKR.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Supported Services:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeCreator.services.map((srv) => (
                      <span
                        key={srv}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAMPAIGN OPPORTUNITIES TAB */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white font-['Syne',sans-serif]">
                Campaign Opportunities
              </h1>
              <p className="text-xs text-slate-400">
                Live campaign briefs matching {activeCreator?.name}&apos;s profile across Pakistan.
              </p>
            </div>

            {creatorCampaignOpportunities.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                badge="Live Opportunities"
                title="No Campaign Opportunities Yet"
                description="As brands launch campaigns matching your content niche, platforms, and deliverables, live briefs will appear here."
                action={{
                  label: 'Review Your Profile',
                  onClick: () => setActiveTab('profile'),
                  icon: User,
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {creatorCampaignOpportunities.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          {camp.category}
                        </span>
                        <span className="text-base font-bold text-emerald-400">
                          PKR {camp.budget.toLocaleString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white">{camp.title}</h3>
                      <p className="text-sm text-slate-300">Brand: {camp.businessName}</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{camp.description}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-400 block font-medium">Deliverables</span>
                          <span className="font-semibold text-white mt-0.5 block">{camp.deliverables.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Target Locations</span>
                          <span className="font-semibold text-white mt-0.5 block">{camp.targetLocations.join(', ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-400">
                          Platforms: {camp.platforms.join(', ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            alert(
                              `Pitch expressed to ${camp.businessName}! In live mode, your creator profile is flagged in their recommendations.`
                            );
                          }}
                          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
                        >
                          Express Interest
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROPOSALS TAB */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-['Syne',sans-serif]">
                Proposals Inbox
              </h1>
              <p className="text-sm text-slate-400">
                Proposals received from brands. Review deliverables, budgets, and respond.
              </p>
            </div>

            {creatorProposals.length === 0 ? (
              <EmptyState
                icon={Send}
                badge="Inbound Offers"
                title="No Proposals Received Yet"
                description="When a brand discovers your profile through AI matching and sends a collaboration proposal, it will appear here for review."
                action={{
                  label: 'Browse Campaign Opportunities',
                  onClick: () => setActiveTab('opportunities'),
                  icon: Megaphone,
                }}
              />
            ) : (
              <div className="space-y-4">
                {creatorProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{prop.businessName}</h3>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                              prop.status === 'Accepted' || prop.status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : prop.status === 'Declined' || prop.status === 'declined'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : prop.status === 'Negotiation'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">Campaign: <span className="font-semibold text-white">{prop.campaignTitle}</span></p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 block font-medium">Offered Budget</span>
                        <span className="text-lg font-bold text-emerald-400">
                          PKR {prop.offeredBudgetPKR.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-sm">
                      <p className="text-slate-300 italic">&quot;{prop.message}&quot;</p>
                      {prop.creatorNote && (
                        <div className="pt-2 border-t border-slate-800 text-amber-300 text-xs">
                          <span className="font-semibold">Your Note / Counter:</span> {prop.creatorNote}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400 block font-medium">Deliverables</span>
                        <span className="text-white font-medium">{prop.proposedDeliverables.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Timeline</span>
                        <span className="text-white font-medium">{prop.timelineDays} days</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Created</span>
                        <span className="text-white font-medium">
                          {new Date(prop.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                      {(prop.status === 'Pending' ||
                        prop.status === 'pending' ||
                        prop.status === 'Negotiation') && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(prop.id, 'Accepted')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer transition-colors"
                          >
                            Accept Proposal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProposal(prop);
                              setNegotiationNote(prop.creatorNote || '');
                            }}
                            className="px-4 py-2 text-sm font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg cursor-pointer transition-colors"
                          >
                            Request Negotiation
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(prop.id, 'Declined')}
                            className="px-4 py-2 text-sm font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg cursor-pointer transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PACKAGES TAB */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white font-['Syne',sans-serif]">
                  Production Packages
                </h1>
                <p className="text-sm text-slate-400">
                  Standard service bundles brands can instantly select in proposals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPackage(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Package</span>
              </button>
            </div>

            {creatorPackages.length === 0 ? (
              <EmptyState
                icon={Package}
                badge="Service Packages"
                title="No Production Packages Listed"
                description="Create standardized service packages with fixed PKR rates and turnaround times to allow businesses to book you faster."
                action={{
                  label: 'Add Package',
                  onClick: () => setIsAddingPackage(true),
                  icon: Plus,
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {creatorPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-white text-lg">{pkg.title}</h3>
                        <span className="text-base font-bold text-emerald-400">
                          PKR {pkg.pricePKR.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{pkg.description}</p>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-slate-800 text-sm text-slate-300">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Turnaround: <strong className="text-white">{pkg.deliveryDays} days</strong></span>
                        <span>Revisions: <strong className="text-white">{pkg.revisionsIncluded}</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.deliverables.map((d) => (
                          <span
                            key={d}
                            className="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-200 border border-slate-700"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => deleteCreatorPackage(pkg.id)}
                        className="text-sm font-medium text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Delete Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && activeCreator && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-['Syne',sans-serif]">
                Creator Settings
              </h1>
              <p className="text-sm text-slate-400">
                Preferences, notifications, and verification status.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Email Notifications</span>
                  <span className="text-slate-400 text-xs">Receive alerts when brands send proposals</span>
                </div>
                <input type="checkbox" defaultChecked className="toggle cursor-pointer" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Marketplace Availability</span>
                  <span className="text-slate-400 text-xs">Show profile in active AI search matches</span>
                </div>
                <input type="checkbox" defaultChecked className="toggle cursor-pointer" />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-semibold text-white block">Account Type</span>
                  <span className="text-slate-400 text-xs">
                    Fictional Demo Creator Persona ({activeCreator.name})
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-xs">
                  Verified Demo
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Negotiation Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Request Negotiation</h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  Campaign: <span className="text-white font-medium">{selectedProposal.campaignTitle}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300">
                Brand Offer:{' '}
                <span className="font-bold text-emerald-400">
                  PKR {selectedProposal.offeredBudgetPKR.toLocaleString()}
                </span>{' '}
                for {selectedProposal.proposedDeliverables.join(', ')}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Counter-Offer Note / Terms</label>
                <textarea
                  rows={4}
                  value={negotiationNote}
                  onChange={(e) => setNegotiationNote(e.target.value)}
                  placeholder="e.g. Can do 2 Reels instead of 1, or counter at PKR 55,000 for additional 30-day digital ad usage rights..."
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingResponse || !negotiationNote.trim()}
                  onClick={() =>
                    handleUpdateStatus(selectedProposal.id, 'Negotiation', negotiationNote)
                  }
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isSubmittingResponse ? 'Submitting...' : 'Submit Counter-Proposal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Package Modal */}
      {isAddingPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Create Production Package</h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  Add a standardized package for {activeCreator?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPackage(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Package Title</label>
                <input
                  type="text"
                  value={packageForm.title}
                  onChange={(e) =>
                    setPackageForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Tech Unboxing & Reel Pack"
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Price (PKR)</label>
                  <input
                    type="number"
                    value={packageForm.pricePKR}
                    onChange={(e) =>
                      setPackageForm((prev) => ({
                        ...prev,
                        pricePKR: Number(e.target.value),
                      }))
                    }
                    min={5000}
                    step={1000}
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Turnaround (Days)</label>
                  <input
                    type="number"
                    value={packageForm.timelineDays}
                    onChange={(e) =>
                      setPackageForm((prev) => ({
                        ...prev,
                        timelineDays: Number(e.target.value),
                      }))
                    }
                    min={1}
                    max={30}
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={packageForm.description}
                  onChange={(e) =>
                    setPackageForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Includes 4K camera setup, studio lighting, and licensed music..."
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 text-sm rounded-lg text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingPackage(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
