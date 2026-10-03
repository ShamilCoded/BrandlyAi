/**
 * DOMAIN TAXONOMIES & CONSTANTS
 */

import type {
  CreatorType,
  NicheCategory,
  SocialPlatform,
  PakistaniCity,
  DeliverableType,
  CreatorServiceType,
  SupportedLanguage,
  CurrencyCode,
} from '@/lib/types/domain';

export const CREATOR_TYPES: CreatorType[] = [
  'Influencer',
  'UGC Creator',
  'Micro Influencer',
  'Content Creator',
];

export const NICHE_CATEGORIES: NicheCategory[] = [
  'Technology',
  'Fashion',
  'Beauty',
  'Food',
  'Fitness',
  'Travel',
  'Lifestyle',
  'Gaming',
  'Education',
  'Business',
];

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  'Instagram',
  'TikTok',
  'YouTube',
];

export const PAKISTANI_CITIES: PakistaniCity[] = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
];

export const DELIVERABLE_TYPES: DeliverableType[] = [
  'Reel',
  'TikTok video',
  'YouTube integration',
  'Story',
  'Product review',
  'UGC video',
  'Product photography',
];

export const CREATOR_SERVICES: CreatorServiceType[] = [
  'Instagram Reel',
  'TikTok Video',
  'YouTube Integration',
  'Story',
  'Product Review',
  'UGC Video',
  'Product Photography',
  'Unboxing Video',
];

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'English',
  'Urdu',
  'Punjabi',
  'Pashto',
  'Sindhi',
];

export const CURRENCY_CODES: CurrencyCode[] = ['PKR', 'USD', 'AED'];

export const BUSINESS_CATEGORIES = [
  'Technology / E-commerce',
  'Restaurant & Hospitality',
  'Fashion & Apparel',
  'Beauty & Skincare',
  'Health & Fitness',
  'Education & EdTech',
  'Financial Services',
  'Consumer Electronics',
] as const;

export const CAMPAIGN_OBJECTIVES = [
  'Product Launch & Awareness',
  'Direct E-commerce Conversions',
  'UGC Ad Creative Production',
  'In-Store / Foot Traffic Drive',
  'Brand Credibility & Product Reviews',
  'Seasonal Collection Showcase',
] as const;

export const AI_MATCHING_FACTORS = [
  {
    key: 'niche',
    label: 'Niche Alignment',
    description: 'Primary and secondary content verticals evaluated against product requirements.',
  },
  {
    key: 'target_audience',
    label: 'Target Audience Fit',
    description: 'Audience age brackets, buyer interests, and regional concentration.',
  },
  {
    key: 'platform',
    label: 'Platform Proficiency',
    description: 'Native short-form and long-form video output across Instagram, TikTok, and YouTube.',
  },
  {
    key: 'location',
    label: 'Location Relevance',
    description: 'Pakistani city presence for local events, sample delivery, and audience trust.',
  },
  {
    key: 'creator_type',
    label: 'Creator Type Alignment',
    description: 'Distinguishes reach-focused Influencers from production-focused UGC Creators.',
  },
  {
    key: 'services',
    label: 'Services & Deliverables',
    description: 'Exact match with requested assets from 4K unboxings to multi-hook ad variations.',
  },
  {
    key: 'budget',
    label: 'Budget Compatibility',
    description: 'Transparent starting rates aligned with business allocation in PKR.',
  },
  {
    key: 'engagement',
    label: 'Engagement Rate',
    description: 'Verified interaction consistency relative to real viewer community.',
  },
  {
    key: 'average_views',
    label: 'Average Views',
    description: 'Steady baseline view velocity per video rather than static vanity numbers.',
  },
  {
    key: 'language',
    label: 'Language Delivery',
    description: 'Fluency in Urdu, English, Punjabi, Pashto, or Sindhi for authentic communication.',
  },
  {
    key: 'availability',
    label: 'Availability & Turnaround',
    description: 'Verified production capacity within the campaign deadline.',
  },
] as const;
