import {
  businessesRepository,
  campaignsRepository,
  creatorPackagesRepository,
  creatorsRepository,
  proposalsRepository,
  recommendationsRepository,
} from '@/lib/repositories/collections';
import { seedDemoDataIfNeeded } from '@/lib/services/seed-service';
import { OrchestratorAgent } from '@/lib/agents/orchestrator-agent';
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
  CreatorType,
  DemoScenario,
  NicheCategory,
  OrchestrationResult,
  OrchestratorProgressEvent,
  PakistaniCity,
  Proposal,
  ProposalStatus,
  Recommendation,
  SocialPlatform,
  SupportedLanguage,
} from '@/lib/types/domain';

export interface CreatorFilterCriteria {
  searchQuery?: string;
  niche?: NicheCategory | 'All';
  creatorType?: CreatorType | 'All';
  location?: PakistaniCity | 'All';
  platform?: SocialPlatform | 'All';
  language?: SupportedLanguage | 'All';
  maxStartingRatePKR?: number;
}

export interface MarketplaceSnapshot {
  manifest: DemoScenario;
  businesses: Business[];
  creators: Creator[];
  packages: CreatorPackage[];
  campaigns: Campaign[];
  recommendations: Recommendation[];
  proposals: Proposal[];
}

export class MarketplaceService {
  static async loadMarketplaceSnapshot(forceReseed = false): Promise<MarketplaceSnapshot> {
    const manifest = await seedDemoDataIfNeeded(forceReseed);
    const [businesses, creators, packages, campaigns, recommendations, proposals] =
      await Promise.all([
        businessesRepository.listDocuments(),
        creatorsRepository.listDocuments(),
        creatorPackagesRepository.listDocuments(),
        campaignsRepository.listDocuments(),
        recommendationsRepository.listDocuments(),
        proposalsRepository.listDocuments(),
      ]);

    const finalBusinesses = businesses.length > 0 ? businesses : DEMO_BUSINESSES;
    const rawCreators = creators.length > 0 ? creators : DEMO_CREATORS;

    // Ensure Shamil is positioned prominently for demo verification
    const sortedCreators = [...rawCreators].sort((a, b) => {
      if (a.id === 'creator-shamil-karachi') return -1;
      if (b.id === 'creator-shamil-karachi') return 1;
      return b.engagementRate - a.engagementRate;
    });

    const rawCampaigns = campaigns.length > 0 ? campaigns : DEMO_CAMPAIGNS;
    const sortedCampaigns = [...rawCampaigns].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );

    return {
      manifest,
      businesses: finalBusinesses,
      creators: sortedCreators,
      packages: packages.length > 0 ? packages : DEMO_CREATOR_PACKAGES,
      campaigns: sortedCampaigns,
      recommendations: recommendations.length > 0 ? recommendations : DEMO_RECOMMENDATIONS,
      proposals: proposals.length > 0 ? proposals : DEMO_PROPOSALS,
    };
  }

  static filterCreators(
    creators: Creator[],
    criteria: CreatorFilterCriteria
  ): Creator[] {
    return creators.filter((c) => {
      if (criteria.niche && criteria.niche !== 'All') {
        const matchesPrimary = c.primaryNiche === criteria.niche;
        const matchesSecondary = c.secondaryNiches.includes(criteria.niche);
        if (!matchesPrimary && !matchesSecondary) return false;
      }

      if (criteria.creatorType && criteria.creatorType !== 'All') {
        if (c.creatorType !== criteria.creatorType) return false;
      }

      if (criteria.location && criteria.location !== 'All') {
        if (c.location !== criteria.location) return false;
      }

      if (criteria.platform && criteria.platform !== 'All') {
        if (!c.platforms.includes(criteria.platform)) return false;
      }

      if (criteria.language && criteria.language !== 'All') {
        if (!c.languages.includes(criteria.language)) return false;
      }

      if (
        criteria.maxStartingRatePKR &&
        criteria.maxStartingRatePKR > 0 &&
        c.startingRatePKR > criteria.maxStartingRatePKR
      ) {
        return false;
      }

      if (criteria.searchQuery && criteria.searchQuery.trim()) {
        const q = criteria.searchQuery.trim().toLowerCase();
        const haystack = [
          c.name,
          c.handle,
          c.location,
          c.primaryNiche,
          ...c.secondaryNiches,
          c.creatorType,
          c.bio,
          ...c.services,
          ...c.contentStyle,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }

  static async saveCampaign(
    campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Campaign> {
    const now = new Date().toISOString();
    const id = campaignData.id || `camp-${Date.now()}`;

    const campaign: Campaign = {
      ...campaignData,
      id,
      createdAt: now,
      updatedAt: now,
      minimumFollowers: campaignData.creatorTypes.includes('UGC Creator')
        ? 0
        : campaignData.minimumFollowers || 0,
    };

    return campaignsRepository.createDocument(campaign);
  }

  /**
   * Primary service for Module 9, 10: Runs the complete Orchestrator Agent workflow
   */
  static async findCreatorRecommendations(
    campaignId: string,
    onProgress?: (event: OrchestratorProgressEvent) => void
  ): Promise<OrchestrationResult> {
    return OrchestratorAgent.findCreatorRecommendations(campaignId, onProgress);
  }

  static async getCreatorDetails(
    creatorId: string
  ): Promise<{ creator: Creator | null; packages: CreatorPackage[] }> {
    const creator = await creatorsRepository.readDocument(creatorId);
    const packages = await creatorPackagesRepository.queryDocuments({
      filters: [{ field: 'creatorId', operator: '==', value: creatorId }],
    });
    return { creator, packages };
  }

  static async createProposal(
    payload: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'>
  ): Promise<Proposal> {
    const now = new Date().toISOString();
    const proposal: Proposal = {
      ...payload,
      id: `prop-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      isDemo: true,
      demoLabel: 'Fictional Demo Proposal',
    };
    return proposalsRepository.createDocument(proposal);
  }

  static async updateProposalStatus(
    proposalId: string,
    status: ProposalStatus,
    creatorNote?: string,
    notes?: string
  ): Promise<Proposal> {
    const updates: Partial<Proposal> = { status };
    if (creatorNote !== undefined) updates.creatorNote = creatorNote;
    if (notes !== undefined) updates.notes = notes;
    return proposalsRepository.updateDocument(proposalId, updates);
  }

  static async updateProposal(
    proposalId: string,
    updates: Partial<Proposal>
  ): Promise<Proposal> {
    return proposalsRepository.updateDocument(proposalId, updates);
  }

  static async updateCreatorProfile(
    creatorId: string,
    updates: Partial<Creator>
  ): Promise<Creator> {
    return creatorsRepository.updateDocument(creatorId, updates);
  }

  static async saveCreatorPackage(
    packageData: Omit<CreatorPackage, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'> & {
      id?: string;
    }
  ): Promise<CreatorPackage> {
    const now = new Date().toISOString();
    if (packageData.id) {
      const existing = await creatorPackagesRepository.readDocument(packageData.id);
      if (existing) {
        return creatorPackagesRepository.updateDocument(packageData.id, {
          ...packageData,
          updatedAt: now,
        });
      }
    }
    const id = packageData.id || `pkg-${Date.now()}`;
    const pkg: CreatorPackage = {
      ...packageData,
      id,
      createdAt: now,
      updatedAt: now,
      isDemo: true,
      demoLabel: 'Fictional Demo Package',
    };
    return creatorPackagesRepository.createDocument(pkg);
  }

  static async deleteCreatorPackage(packageId: string): Promise<boolean> {
    return creatorPackagesRepository.deleteDocument(packageId);
  }

  static async updateRecommendationStatus(
    recommendationId: string,
    status: Recommendation['status']
  ): Promise<Recommendation> {
    return recommendationsRepository.updateDocument(recommendationId, { status });
  }

  static async updateBusinessProfile(
    businessId: string,
    updates: Partial<Business>
  ): Promise<Business> {
    return businessesRepository.updateDocument(businessId, updates);
  }

  static async registerBusiness(
    businessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'> & { id?: string }
  ): Promise<Business> {
    const now = new Date().toISOString();
    const slug = (businessData.slug || businessData.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = businessData.id || `biz-${slug || Date.now()}`;

    const business: Business = {
      ...businessData,
      id,
      slug,
      createdAt: now,
      updatedAt: now,
      isDemo: true,
      demoLabel: 'Registered Business',
    };

    return businessesRepository.createDocument(business);
  }

  static async registerCreator(
    creatorData: Omit<Creator, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'demoLabel'> & { id?: string }
  ): Promise<Creator> {
    const now = new Date().toISOString();
    const handleClean = creatorData.handle.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9._]+/g, '');
    const id = creatorData.id || `creator-${handleClean || Date.now()}`;

    const creator: Creator = {
      ...creatorData,
      id,
      handle: creatorData.handle.startsWith('@') ? creatorData.handle : `@${creatorData.handle}`,
      portfolioItems: creatorData.portfolioItems || [],
      portfolioHighlights: creatorData.portfolioHighlights || [],
      previousCampaignCategories: creatorData.previousCampaignCategories || [creatorData.primaryNiche],
      audienceSummary: creatorData.audienceSummary || {
        topCities: [creatorData.location],
        ageRange: '18–35',
        genderSplit: '50% Female · 50% Male',
      },
      createdAt: now,
      updatedAt: now,
      isDemo: true,
      demoLabel: 'Registered Creator',
    };

    return creatorsRepository.createDocument(creator);
  }
}
