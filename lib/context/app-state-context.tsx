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
  OrchestratorProgressEvent,
  Proposal,
  ProposalStatus,
  Recommendation,
  User,
} from '@/lib/types/domain';
import {
  ensureAuthSession,
  signOutAuthUser,
  subscribeToAuthChanges,
  testFirestoreConnection,
} from '@/lib/firebase/client';
import { usersRepository } from '@/lib/repositories/collections';

export type UserRole = 'business' | 'creator';

interface AppStateContextValue {
  isLoading: boolean;
  error: string | null;
  manifest: DemoScenario | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userSession: User | null;
  firebaseConnected: boolean;
  signOutSession: () => Promise<void>;
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
  runMatchingOrchestration: (
    campaignId: string,
    onProgress?: (event: OrchestratorProgressEvent) => void
  ) => Promise<OrchestrationResult>;
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
  registerBusiness: (
    data: Omit<Business, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'> & { id?: string },
    userEmail?: string
  ) => Promise<Business>;
  registerCreator: (
    data: Omit<Creator, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'> & { id?: string },
    userEmail?: string
  ) => Promise<Creator>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<DemoScenario | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('business');
  const [userSession, setUserSession] = useState<User | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);

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

  // Firebase connection and session restoration on app boot
  useEffect(() => {
    // 1. Verify Firestore connectivity
    testFirestoreConnection().then((connected) => {
      setFirebaseConnected(connected);
      if (connected) {
        console.log('[Brandly.ai] Connected to Cloud Firestore database');
      }
    });

    // 2. Restore active session from localStorage if present
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('brandly_active_session_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.role) {
            setUserRole(parsed.role as UserRole);
            if (parsed.role === 'business' && parsed.profileId) {
              setActiveBusinessId(parsed.profileId);
            } else if (parsed.role === 'creator' && parsed.profileId) {
              setActiveCreatorId(parsed.profileId);
            }
            setUserSession({
              id: parsed.uid || `user-${parsed.profileId}`,
              email: parsed.email || 'user@brandly.ai',
              displayName: parsed.displayName || parsed.role,
              role: parsed.role,
              businessId: parsed.role === 'business' ? parsed.profileId : undefined,
              creatorId: parsed.role === 'creator' ? parsed.profileId : undefined,
              city: 'Karachi',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isDemo: false,
            });
          }
        }
      } catch (err) {
        console.warn('[Brandly.ai] Session restoration note:', err);
      }
    }

    // 3. Listen to Firebase Auth state
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        console.log('[Brandly.ai] Firebase Auth user active:', user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

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
    async (
      campaignId: string,
      onProgress?: (event: OrchestratorProgressEvent) => void
    ): Promise<OrchestrationResult> => {
      const result = await MarketplaceService.findCreatorRecommendations(
        campaignId,
        onProgress
      );
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

  const signOutSession = useCallback(async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('brandly_active_session_v1');
    }
    await signOutAuthUser();
    setUserSession(null);
    setActiveBusinessId(AppConfig.defaultDemoBusinessId);
    setActiveCreatorId('creator-shamil-karachi');
    setUserRole('business');
  }, []);

  const registerBusiness = useCallback(
    async (
      data: Omit<Business, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'> & { id?: string },
      userEmail?: string
    ): Promise<Business> => {
      const authUser = await ensureAuthSession();
      const created = await MarketplaceService.registerBusiness(data);
      const uid = authUser?.uid || `user-${created.id}`;
      const sessionUser: User = {
        id: uid,
        email: userEmail || `${created.slug}@brandly.ai`,
        displayName: created.name,
        role: 'business',
        businessId: created.id,
        city: created.headquarters,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: false,
      };
      try {
        await usersRepository.createDocument(sessionUser);
      } catch (err) {
        console.warn('[Brandly.ai] usersRepository create note:', err);
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'brandly_active_session_v1',
          JSON.stringify({
            uid,
            role: 'business',
            profileId: created.id,
            displayName: created.name,
            email: sessionUser.email,
          })
        );
      }
      setUserSession(sessionUser);
      setBusinesses((prev) => [created, ...prev.filter((b) => b.id !== created.id)]);
      setActiveBusinessId(created.id);
      setUserRole('business');
      await refreshMarketplace(false);
      return created;
    },
    [refreshMarketplace]
  );

  const registerCreator = useCallback(
    async (
      data: Omit<Creator, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'> & { id?: string },
      userEmail?: string
    ): Promise<Creator> => {
      const authUser = await ensureAuthSession();
      const created = await MarketplaceService.registerCreator(data);
      const uid = authUser?.uid || `user-${created.id}`;
      const sessionUser: User = {
        id: uid,
        email: userEmail || `${created.handle.replace(/^@/, '')}@creators.brandly.ai`,
        displayName: created.name,
        role: 'creator',
        creatorId: created.id,
        city: created.location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: false,
      };
      try {
        await usersRepository.createDocument(sessionUser);
      } catch (err) {
        console.warn('[Brandly.ai] usersRepository create note:', err);
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'brandly_active_session_v1',
          JSON.stringify({
            uid,
            role: 'creator',
            profileId: created.id,
            displayName: created.name,
            email: sessionUser.email,
          })
        );
      }
      setUserSession(sessionUser);
      setCreators((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setActiveCreatorId(created.id);
      setUserRole('creator');
      await refreshMarketplace(false);
      return created;
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
      userSession,
      firebaseConnected,
      signOutSession,
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
      registerBusiness,
      registerCreator,
    }),
    [
      isLoading,
      error,
      manifest,
      userRole,
      userSession,
      firebaseConnected,
      signOutSession,
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
      registerBusiness,
      registerCreator,
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
