/**
 * CORE DOMAIN ENTITIES & SCHEMAS
 * Models for: User, Business, Creator, CreatorPackage, Campaign, Recommendation, Proposal, DemoScenario,
 * NormalizedCampaignSpec, CreatorCandidate, MatchingResult, and OrchestratorWorkflowState.
 */

export type UserRole = 'business' | 'creator' | 'admin';

export type CreatorType =
  | 'Influencer'
  | 'UGC Creator'
  | 'Micro Influencer'
  | 'Content Creator';

export type NicheCategory =
  | 'Technology'
  | 'Fashion'
  | 'Beauty'
  | 'Food'
  | 'Fitness'
  | 'Travel'
  | 'Lifestyle'
  | 'Gaming'
  | 'Education'
  | 'Business';

export type SocialPlatform = 'Instagram' | 'TikTok' | 'YouTube';

export type PakistaniCity =
  | 'Karachi'
  | 'Lahore'
  | 'Islamabad'
  | 'Rawalpindi'
  | 'Faisalabad'
  | 'Multan'
  | 'Peshawar';

export type SupportedLanguage =
  | 'English'
  | 'Urdu'
  | 'Punjabi'
  | 'Pashto'
  | 'Sindhi';

export type DeliverableType =
  | 'Reel'
  | 'TikTok video'
  | 'YouTube integration'
  | 'Story'
  | 'Product review'
  | 'UGC video'
  | 'Product photography';

export type CreatorServiceType =
  | 'Instagram Reel'
  | 'TikTok Video'
  | 'YouTube Integration'
  | 'Story'
  | 'Product Review'
  | 'UGC Video'
  | 'Product Photography'
  | 'Unboxing Video';

export type CurrencyCode = 'PKR' | 'USD' | 'AED';

export type CampaignStatus =
  | 'active'
  | 'draft'
  | 'matching'
  | 'in_review'
  | 'completed';

export type ProposalStatus =
  | 'Pending'
  | 'Accepted'
  | 'Declined'
  | 'Negotiation'
  | 'Completed'
  | 'Cancelled'
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'shortlisted';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  demoLabel?: string;
}

export interface User extends BaseEntity {
  email: string;
  displayName: string;
  role: UserRole;
  businessId?: string;
  creatorId?: string;
  city: PakistaniCity;
}

export interface Business extends BaseEntity {
  name: string;
  slug: string;
  category: string;
  industry: NicheCategory;
  description: string;
  headquarters: PakistaniCity;
  targetMarkets: PakistaniCity[];
  website: string;
  flagshipProducts: string[];
  preferredPlatforms: SocialPlatform[];
  typicalBudgetPKR: number;
  contactPerson: string;
  contactRole: string;
}

export interface CreatorPortfolioItem {
  id: string;
  title: string;
  format: DeliverableType | string;
  category: NicheCategory;
  views: number;
  description: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
}

export interface Creator extends BaseEntity {
  name: string;
  handle: string;
  creatorType: CreatorType;
  location: PakistaniCity;
  followers: number;
  averageViews: number;
  engagementRate: number; // percentage e.g. 5.8
  primaryNiche: NicheCategory;
  secondaryNiches: NicheCategory[];
  platforms: SocialPlatform[];
  languages: SupportedLanguage[];
  services: CreatorServiceType[];
  bio: string;
  contentStyle: string[];
  startingRatePKR: number;
  availability: 'Available' | 'Limited' | 'Booked';
  turnaroundDays: number;
  avatarUrl?: string;
  portfolioHighlights: string[];
  portfolioItems: CreatorPortfolioItem[];
  previousCampaignCategories: string[];
  audienceSummary: {
    topCities: PakistaniCity[];
    ageRange: string;
    genderSplit: string;
  };
}

export interface CreatorPackage extends BaseEntity {
  creatorId: string;
  creatorName: string;
  title: string;
  platform: SocialPlatform;
  deliverables: DeliverableType[];
  pricePKR: number;
  currency: CurrencyCode;
  deliveryDays: number;
  revisionsIncluded: number;
  usageRightsDays: number;
  description: string;
}

export interface NormalizedCampaignSpec {
  campaign_category: string;
  product_or_service: string;
  objective: string;
  budget: number;
  currency: string;
  target_audience: string;
  target_location: string[];
  platforms: string[];
  niches: string[];
  creator_types: string[];
  minimum_followers: number;
  deliverables: string[];
  content_style: string[];
  duration: string;
  languages: string[];
  missing_information: string[];
  assumptions: string[];
  summary_explanation: string;
}

export interface Campaign extends BaseEntity {
  businessId: string;
  businessName: string;
  title: string;
  category: string;
  productOrService: string;
  objective: string;
  description: string;
  budget: number;
  currency: CurrencyCode;
  audienceAgeRange: string;
  audienceGender: string;
  targetLocations: PakistaniCity[];
  audienceInterests: string[];
  platforms: SocialPlatform[];
  creatorTypes: CreatorType[];
  preferredNiches: NicheCategory[];
  minimumFollowers: number;
  languages: SupportedLanguage[];
  creatorLocations: PakistaniCity[];
  requiredServices: CreatorServiceType[];
  deliverables: DeliverableType[];
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  status: CampaignStatus;
  normalizedSpec?: NormalizedCampaignSpec;
  agentAnalyzedAt?: string;
}

/**
 * MODULE 7 — CREATOR INTELLIGENCE AGENT CANDIDATE RECORD
 * Contains normalized fields strictly required for downstream matching.
 */
export interface CreatorCandidate {
  creatorId: string;
  name: string;
  handle: string;
  creatorType: CreatorType;
  location: PakistaniCity;
  followers: number;
  averageViews: number;
  engagementRate: number;
  primaryNiche: NicheCategory;
  secondaryNiches: NicheCategory[];
  platforms: SocialPlatform[];
  languages: SupportedLanguage[];
  services: CreatorServiceType[];
  startingRatePKR: number;
  availability: 'Available' | 'Limited' | 'Booked';
  turnaroundDays: number;
  contentStyle: string[];
  previousCampaignCategories: string[];
  audienceTopCities: PakistaniCity[];
  retrievalReasons: string[];
}

/**
 * MODULE 8 — MATCHING AGENT EVALUATION RESULT
 */
export interface CreatorMatchEvaluation {
  creatorId: string;
  matchScore: number; // 0-100 decision support signal
  recommendation: string; // e.g. "Strong Match", "Recommended", "Consider with Revisions"
  why_this_creator: string[];
  strengths: string[];
  considerations: string[];
}

/**
 * MODULE 8 & 10 — RECOMMENDATION ENTITY (Stored in Firestore `recommendations`)
 */
export interface Recommendation extends BaseEntity {
  campaignId: string;
  campaignTitle: string;
  businessId: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorType: CreatorType;
  creatorLocation: PakistaniCity;
  primaryNiche: NicheCategory;
  platforms: SocialPlatform[];
  followers: number;
  averageViews: number;
  engagementRate: number;
  estimatedRatePKR: number;
  matchScore: number;
  whyThisCreator: string; // Concise summary
  whyThisCreatorBullets: string[];
  strengths: string[];
  considerations: string[];
  matchedCriteria: string[];
  services: CreatorServiceType[];
  status: 'recommended' | 'shortlisted' | 'contacted' | 'dismissed';
}

export interface Proposal extends BaseEntity {
  campaignId: string;
  campaignTitle: string;
  businessId: string;
  businessName: string;
  creatorId: string;
  creatorName: string;
  creatorType: CreatorType;
  packageId?: string;
  proposedDeliverables: DeliverableType[];
  offeredBudgetPKR: number;
  currency: CurrencyCode;
  timelineDays: number;
  deadline?: string;
  notes?: string;
  status: ProposalStatus;
  message: string;
  creatorNote?: string;
}

export interface DemoScenario extends BaseEntity {
  seedVersion: string;
  seededAt: string;
  totalCreators: number;
  totalBusinesses: number;
  totalCampaigns: number;
  primaryBusinessId: string;
  mandatoryCreatorId: string;
  notes: string;
}

export interface CampaignAgentInput {
  campaign_name?: string;
  campaign_description?: string;
  category?: string;
  product_or_service?: string;
  objective?: string;
  budget?: number;
  currency?: string;
  target_audience?: string;
  locations?: string[];
  platforms?: string[];
  niches?: string[];
  creator_types?: string[];
  minimum_followers?: number;
  deliverables?: string[];
  services?: string[];
  duration?: string;
  languages?: string[];
  other_requirements?: string;
}

export type OrchestratorStage =
  | 'idle'
  | 'understanding_campaign'
  | 'finding_relevant_creators'
  | 'evaluating_creator_fit'
  | 'preparing_recommendations'
  | 'completed'
  | 'failed';

export interface OrchestrationLog {
  timestamp: string;
  stage: string;
  message: string;
}

export interface OrchestrationResult {
  campaignId: string;
  campaignTitle: string;
  normalizedSpec: NormalizedCampaignSpec;
  candidatesAnalyzed: number;
  recommendations: Recommendation[];
  logs: OrchestrationLog[];
  completedAt: string;
  status: 'succeeded' | 'empty' | 'failed';
  statusMessage: string;
}
