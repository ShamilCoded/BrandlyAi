'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppConfig } from '@/lib/config/env';
import { MarketplaceService } from '@/lib/services/marketplace-service';
import {
  DEMO_BUSINESSES,
  DEMO_CREATORS,
  DEMO_CREATOR_PACKAGES,
  DEMO_CAMPAIGNS,
  DEMO_RECOMMENDATIONS,
  DEMO_PROPOSALS,
} from '@/lib/seed/demo-dataset';
import type {
  Business,
  Campaign,
  Creator,
  CreatorPackage,
  DemoScenario,
  OrchestrationResult,
  Proposal,
  ProposalStatus,
  Recommendation,
} from '@/lib/types/domain';

export type UserRole = 'business' | 'creator';

interface AppStateContextValue {
  isLoading: boolean;
  error: string | null;
  manifest: DemoScenario | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  businesses: Business[];
  activeBusiness: Business | null;
  setActiveBusinessId: (id: string) => void;
  creators: Creator[];
  activeCreator: Creator | null;
  setActiveCreatorId: (id: string) => void;
  packages: CreatorPackage[];
  creatorPackages: CreatorPackage[];
  campaigns: Campaign[];
  businessCampaigns: Campaign[];
  creatorCampaignOpportunities: Campaign[];
  recommendations: Recommendation[];
  businessRecommendations: Recommendation[];
  proposals: Proposal[];
  businessProposals: Proposal[];
  creatorProposals: Proposal[];
  calculateProfileCompleteness: (creator: Creator | null) => number;
  refreshMarketplace: (forceReseed?: boolean) => Promise<void>;
  saveCampaign: (
    data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Promise<Campaign>;
  runMatchingOrchestration: (campaignId: string) => Promise<OrchestrationResult>;
  createProposal: (
    payload: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'>
  ) => Promise<Proposal>;
  updateProposalStatus: (
    id: string,
    status: ProposalStatus,
    creatorNote?: string,
    notes?: string
  ) => Promise<void>;
  updateRecommendationStatus: (
    id: string,
    status: Recommendation['status']
  ) => Promise<void>;
  updateBusinessProfile: (id: string, updates: Partial<Business>) => Promise<void>;
  updateCreatorProfile: (id: string, updates: Partial<Creator>) => Promise<void>;
  saveCreatorPackage: (
    packageData: Omit<CreatorPackage, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'> & {
      id?: string;
    }
  ) => Promise<CreatorPackage>;
  deleteCreatorPackage: (packageId: string) => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<DemoScenario | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('business');

  const [businesses, setBusinesses] = useState<Business[]>(() => DEMO_BUSINESSES);
  const [activeBusinessId, setActiveBusinessId] = useState<string>(
    AppConfig.defaultDemoBusinessId
  );

  const [creators, setCreators] = useState<Creator[]>(() => DEMO_CREATORS);
  const [activeCreatorId, setActiveCreatorId] = useState<string>(
    'creator-shamil-karachi'
  );

  const [packages, setPackages] = useState<CreatorPackage[]>(() => DEMO_CREATOR_PACKAGES);
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => DEMO_CAMPAIGNS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => DEMO_RECOMMENDATIONS);
  const [proposals, setProposals] = useState<Proposal[]>(() => DEMO_PROPOSALS);

  const refreshMarketplace = useCallback(async (forceReseed = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const snapshot = await MarketplaceService.loadMarketplaceSnapshot(forceReseed);
      setManifest(snapshot.manifest);
      if (snapshot.businesses?.length) setBusinesses(snapshot.businesses);
      if (snapshot.creators?.length) setCreators(snapshot.creators);
      if (snapshot.packages?.length) setPackages(snapshot.packages);
      if (snapshot.campaigns?.length) setCampaigns(snapshot.campaigns);
      if (snapshot.recommendations?.length) setRecommendations(snapshot.recommendations);
      if (snapshot.proposals?.length) setProposals(snapshot.proposals);
    } catch (err) {
      console.warn('[Brandly.ai] Marketplace snapshot refresh note:', err);
      // Preserve demo datasets so UI never becomes empty
      setBusinesses((prev) => (prev.length > 0 ? prev : DEMO_BUSINESSES));
      setCreators((prev) => (prev.length > 0 ? prev : DEMO_CREATORS));
      setPackages((prev) => (prev.length > 0 ? prev : DEMO_CREATOR_PACKAGES));
      setCampaigns((prev) => (prev.length > 0 ? prev : DEMO_CAMPAIGNS));
      setRecommendations((prev) => (prev.length > 0 ? prev : DEMO_RECOMMENDATIONS));
      setProposals((prev) => (prev.length > 0 ? prev : DEMO_PROPOSALS));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMarketplace(false);
  }, [refreshMarketplace]);

  const activeBusiness = useMemo(() => {
    return (
      businesses.find((b) => b.id === activeBusinessId) ||
      businesses.find((b) => b.id === AppConfig.defaultDemoBusinessId) ||
      businesses[0] ||
      DEMO_BUSINESSES[0]
    );
  }, [businesses, activeBusinessId]);

  const activeCreator = useMemo(() => {
    return (
      creators.find((c) => c.id === activeCreatorId) ||
      creators.find((c) => c.id === 'creator-shamil-karachi') ||
      creators[0] ||
      DEMO_CREATORS[0]
    );
  }, [creators, activeCreatorId]);

  const businessCampaigns = useMemo(() => {
    if (!activeBusiness) return campaigns;
    return campaigns.filter((c) => c.businessId === activeBusiness.id);
  }, [campaigns, activeBusiness]);

  const businessRecommendations = useMemo(() => {
    if (!activeBusiness) return recommendations;
    return recommendations.filter((r) => r.businessId === activeBusiness.id);
  }, [recommendations, activeBusiness]);

  const businessProposals = useMemo(() => {
    if (!activeBusiness) return proposals;
    return proposals.filter((p) => p.businessId === activeBusiness.id);
  }, [proposals, activeBusiness]);

  const creatorProposals = useMemo(() => {
    if (!activeCreator) return proposals;
    return proposals.filter((p) => p.creatorId === activeCreator.id);
  }, [proposals, activeCreator]);

  const creatorPackages = useMemo(() => {
    if (!activeCreator) return packages;
    return packages.filter((pkg) => pkg.creatorId === activeCreator.id);
  }, [packages, activeCreator]);

  const creatorCampaignOpportunities = useMemo(() => {
    if (!activeCreator) return campaigns;
    return campaigns.filter((camp) => {
      if (camp.status !== 'active') return false;
      const nicheMatch =
        camp.preferredNiches.includes(activeCreator.primaryNiche) ||
        activeCreator.secondaryNiches.some((sn) => camp.preferredNiches.includes(sn));
      const platformMatch = activeCreator.platforms.some((p) =>
        camp.platforms.includes(p)
      );
      const typeMatch = camp.creatorTypes.includes(activeCreator.creatorType);
      return nicheMatch || platformMatch || typeMatch;
    });
  }, [campaigns, activeCreator]);

  const calculateProfileCompleteness = useCallback(
    (creator: Creator | null): number => {
      if (!creator) return 0;
      let score = 0;
      if (creator.name && creator.handle) score += 15;
      if (creator.bio && creator.bio.length >= 20) score += 15;
      if (creator.location) score += 10;
      if (creator.primaryNiche) score += 10;
      if (creator.platforms && creator.platforms.length > 0) score += 10;
      if (creator.services && creator.services.length > 0) score += 10;
      if (creator.languages && creator.languages.length > 0) score += 10;
      const hasPackages = packages.some((p) => p.creatorId === creator.id);
      if (hasPackages) score += 10;
      if (creator.startingRatePKR > 0) score += 10;
      return Math.min(100, score);
    },
    [packages]
  );

  const saveCampaign = useCallback(
    async (
      data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
    ): Promise<Campaign> => {
      const saved = await MarketplaceService.saveCampaign(data);
      setCampaigns((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      if (saved.businessId) {
        setActiveBusinessId(saved.businessId);
      }
      await refreshMarketplace(false);
      return saved;
    },
    [refreshMarketplace]
  );

  const runMatchingOrchestration = useCallback(
    async (campaignId: string): Promise<OrchestrationResult> => {
      const result = await MarketplaceService.findCreatorRecommendations(campaignId);
      await refreshMarketplace(false);
      return result;
    },
    [refreshMarketplace]
  );

  const createProposal = useCallback(
    async (
      payload: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'>
    ): Promise<Proposal> => {
      const created = await MarketplaceService.createProposal(payload);
      await refreshMarketplace(false);
      return created;
    },
    [refreshMarketplace]
  );

  const updateProposalStatus = useCallback(
    async (
      id: string,
      status: ProposalStatus,
      creatorNote?: string,
      notes?: string
    ) => {
      await MarketplaceService.updateProposalStatus(id, status, creatorNote, notes);
      await refreshMarketplace(false);
    },
    [refreshMarketplace]
  );

  const updateRecommendationStatus = useCallback(
    async (id: string, status: Recommendation['status']) => {
      await MarketplaceService.updateRecommendationStatus(id, status);
      await refreshMarketplace(false);
    },
    [refreshMarketplace]
  );

  const updateBusinessProfile = useCallback(
    async (id: string, updates: Partial<Business>) => {
      await MarketplaceService.updateBusinessProfile(id, updates);
      await refreshMarketplace(false);
    },
    [refreshMarketplace]
  );

  const updateCreatorProfile = useCallback(
    async (id: string, updates: Partial<Creator>) => {
      await MarketplaceService.updateCreatorProfile(id, updates);
      await refreshMarketplace(false);
    },
    [refreshMarketplace]
  );

  const saveCreatorPackage = useCallback(
    async (
      packageData: Omit<CreatorPackage, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'> & {
        id?: string;
      }
    ): Promise<CreatorPackage> => {
      const saved = await MarketplaceService.saveCreatorPackage(packageData);
      await refreshMarketplace(false);
      return saved;
    },
    [refreshMarketplace]
  );

  const deleteCreatorPackage = useCallback(
    async (packageId: string) => {
      await MarketplaceService.deleteCreatorPackage(packageId);
      await refreshMarketplace(false);
    },
    [refreshMarketplace]
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      isLoading,
      error,
      manifest,
      userRole,
      setUserRole,
      businesses,
      activeBusiness,
      setActiveBusinessId,
      creators,
      activeCreator,
      setActiveCreatorId,
      packages,
      creatorPackages,
      campaigns,
      businessCampaigns,
      creatorCampaignOpportunities,
      recommendations,
      businessRecommendations,
      proposals,
      businessProposals,
      creatorProposals,
      calculateProfileCompleteness,
      refreshMarketplace,
      saveCampaign,
      runMatchingOrchestration,
      createProposal,
      updateProposalStatus,
      updateRecommendationStatus,
      updateBusinessProfile,
      updateCreatorProfile,
      saveCreatorPackage,
      deleteCreatorPackage,
    }),
    [
      isLoading,
      error,
      manifest,
      userRole,
      businesses,
      activeBusiness,
      creators,
      activeCreator,
      packages,
      creatorPackages,
      campaigns,
      businessCampaigns,
      creatorCampaignOpportunities,
      recommendations,
      businessRecommendations,
      proposals,
      businessProposals,
      creatorProposals,
      calculateProfileCompleteness,
      refreshMarketplace,
      saveCampaign,
      runMatchingOrchestration,
      createProposal,
      updateProposalStatus,
      updateRecommendationStatus,
      updateBusinessProfile,
      updateCreatorProfile,
      saveCreatorPackage,
      deleteCreatorPackage,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
