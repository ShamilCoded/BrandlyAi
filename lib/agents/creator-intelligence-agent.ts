/**
 * MODULE 7 — CREATOR INTELLIGENCE AGENT
 * Responsible for candidate retrieval and deterministic filtering.
 * Never sends the entire database to Gemini.
 * Returns 10-20 relevant candidates to Matching Agent.
 */

import {
  creatorsRepository,
  creatorPackagesRepository,
} from '@/lib/repositories/collections';
import type {
  Creator,
  CreatorCandidate,
  CreatorPackage,
  NormalizedCampaignSpec,
} from '@/lib/types/domain';

export class CreatorIntelligenceAgent {
  /**
   * Tool: search_creators
   */
  static async search_creators(keyword: string): Promise<Creator[]> {
    const all = await creatorsRepository.listDocuments();
    const q = keyword.trim().toLowerCase();
    if (!q) return all;
    return all.filter((c) => {
      const text = [
        c.name,
        c.handle,
        c.location,
        c.primaryNiche,
        ...c.secondaryNiches,
        c.creatorType,
        c.bio,
        ...c.services,
      ]
        .join(' ')
        .toLowerCase();
      return text.includes(q);
    });
  }

  /**
   * Tool: get_creator_profile
   */
  static async get_creator_profile(creatorId: string): Promise<Creator | null> {
    return creatorsRepository.readDocument(creatorId);
  }

  /**
   * Tool: get_creator_packages
   */
  static async get_creator_packages(creatorId: string): Promise<CreatorPackage[]> {
    return creatorPackagesRepository.queryDocuments({
      filters: [{ field: 'creatorId', operator: '==', value: creatorId }],
    });
  }

  /**
   * Tool: filter_creators
   * Core deterministic candidate retrieval workflow:
   * 1. Read relevant creators from Firestore
   * 2. Apply deterministic filters across niche, location, platform, creatorType, services, languages
   * 3. Respect UGC distinction (follower count is not a mandatory barrier for UGC Creators)
   * 4. Return top 10-20 candidates
   */
  static async filter_creators(
    spec: NormalizedCampaignSpec
  ): Promise<CreatorCandidate[]> {
    const allCreators = await creatorsRepository.listDocuments();

    const scoredCandidates: {
      creator: Creator;
      score: number;
      reasons: string[];
    }[] = [];

    const normPlatforms = (spec.platforms || []).map((p) => p.toLowerCase());
    const normNiches = (spec.niches || []).map((n) => n.toLowerCase());
    const normLocations = (spec.target_location || []).map((l) => l.toLowerCase());
    const normLanguages = (spec.languages || []).map((l) => l.toLowerCase());
    const normCreatorTypes = (spec.creator_types || []).map((ct) => ct.toLowerCase());
    const budgetCap = spec.budget > 0 ? spec.budget : 500000;

    for (const c of allCreators) {
      const reasons: string[] = [];
      let fitPoints = 0;

      // 1. Niche Compatibility (Primary niche: 4 pts, Secondary: 2 pts)
      const primaryMatch = normNiches.includes(c.primaryNiche.toLowerCase());
      const secondaryMatch = c.secondaryNiches.some((sn) =>
        normNiches.includes(sn.toLowerCase())
      );

      if (primaryMatch) {
        fitPoints += 4;
        reasons.push(`Primary niche alignment: ${c.primaryNiche}`);
      } else if (secondaryMatch) {
        fitPoints += 2;
        reasons.push(`Secondary niche match: ${c.secondaryNiches.join(', ')}`);
      } else {
        // Niche mismatch is a strong disqualifier unless broad lifestyle
        if (normNiches.length > 0 && !c.secondaryNiches.includes('Lifestyle')) {
          continue;
        }
      }

      // 2. Creator Type Fit
      const typeMatch =
        normCreatorTypes.length === 0 ||
        normCreatorTypes.includes(c.creatorType.toLowerCase());
      if (typeMatch) {
        fitPoints += 3;
        reasons.push(`Matches requested creator type: ${c.creatorType}`);
      }

      // 3. Platform Alignment
      const sharedPlatforms = c.platforms.filter((p) =>
        normPlatforms.includes(p.toLowerCase())
      );
      if (sharedPlatforms.length > 0) {
        fitPoints += sharedPlatforms.length * 2;
        reasons.push(`Active on campaign platforms: ${sharedPlatforms.join(', ')}`);
      } else if (normPlatforms.length > 0) {
        // Incompatible platform
        continue;
      }

      // 4. Location Relevance
      const locationMatch =
        normLocations.length === 0 ||
        normLocations.includes(c.location.toLowerCase()) ||
        c.audienceSummary.topCities.some((tc) =>
          normLocations.includes(tc.toLowerCase())
        );

      if (locationMatch) {
        fitPoints += 2;
        reasons.push(`Local presence/audience in ${c.location}`);
      }

      // 5. Follower Floor Rules (CRITICAL UGC DISTINCTION)
      const isUgc = c.creatorType === 'UGC Creator';
      if (isUgc) {
        // Follower count is NOT a mandatory qualification for UGC creators
        fitPoints += 2;
        reasons.push(
          'UGC Creator evaluated on content-production capability rather than audience size'
        );
      } else {
        if (spec.minimum_followers > 0) {
          if (c.followers >= spec.minimum_followers) {
            fitPoints += 2;
            reasons.push(
              `Meets follower floor (${c.followers.toLocaleString()} >= ${spec.minimum_followers.toLocaleString()})`
            );
          } else {
            // Remove clearly incompatible non-UGC creators who fail the follower floor
            continue;
          }
        }
      }

      // 6. Language Delivery
      const sharedLangs = c.languages.filter((l) =>
        normLanguages.includes(l.toLowerCase())
      );
      if (sharedLangs.length > 0) {
        fitPoints += 1;
        reasons.push(`Bilingual delivery in ${sharedLangs.join(', ')}`);
      }

      // 7. Budget / Pricing Compatibility
      if (c.startingRatePKR <= budgetCap) {
        fitPoints += 2;
        reasons.push(
          `Starting rate (PKR ${c.startingRatePKR.toLocaleString()}) fits budget`
        );
      }

      // 8. Availability
      if (c.availability === 'Available') {
        fitPoints += 1;
        reasons.push('Immediate production availability');
      }

      // Retain creators that have genuine relevance points
      if (fitPoints >= 6) {
        scoredCandidates.push({ creator: c, score: fitPoints, reasons });
      }
    }

    // Sort deterministically by relevance score to return a manageable candidate set (10–20)
    scoredCandidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.creator.engagementRate - a.creator.engagementRate;
    });

    const topSlice = scoredCandidates.slice(0, 18);

    // Normalize candidate records containing only fields required for downstream matching
    return topSlice.map(({ creator, reasons }) => ({
      creatorId: creator.id,
      name: creator.name,
      handle: creator.handle,
      creatorType: creator.creatorType,
      location: creator.location,
      followers: creator.followers,
      averageViews: creator.averageViews,
      engagementRate: creator.engagementRate,
      primaryNiche: creator.primaryNiche,
      secondaryNiches: creator.secondaryNiches,
      platforms: creator.platforms,
      languages: creator.languages,
      services: creator.services,
      startingRatePKR: creator.startingRatePKR,
      availability: creator.availability,
      turnaroundDays: creator.turnaroundDays,
      contentStyle: creator.contentStyle,
      previousCampaignCategories: creator.previousCampaignCategories || [],
      audienceTopCities: creator.audienceSummary?.topCities || [creator.location],
      retrievalReasons: reasons,
    }));
  }
}
