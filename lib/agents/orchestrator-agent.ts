/**
 * MODULE 9 — ORCHESTRATOR AGENT
 * The central coordinator of Brandly.ai's AI workflow:
 * Business Campaign
 * ↓
 * Orchestrator
 * ↓
 * Campaign Agent (normalize & structure brief)
 * ↓
 * Creator Intelligence Agent (retrieve & deterministically filter candidates)
 * ↓
 * Matching Agent (evaluate semantic creator fit)
 * ↓
 * Recommendations (save to Firestore)
 * ↓
 * Business UI
 *
 * Exposes primary service: findCreatorRecommendations(campaignId)
 */

import {
  campaignsRepository,
  creatorsRepository,
  recommendationsRepository,
} from '@/lib/repositories/collections';
import { buildNormalizedCampaignSpec } from '@/lib/agents/campaign-agent';
import { CreatorIntelligenceAgent } from '@/lib/agents/creator-intelligence-agent';
import { MatchingAgent } from '@/lib/agents/matching-agent';
import type {
  Campaign,
  NormalizedCampaignSpec,
  OrchestrationLog,
  OrchestrationResult,
  Recommendation,
} from '@/lib/types/domain';

export class OrchestratorAgent {
  /**
   * Primary Application Service: findCreatorRecommendations(campaignId)
   */
  static async findCreatorRecommendations(
    campaignId: string
  ): Promise<OrchestrationResult> {
    const logs: OrchestrationLog[] = [];
    const addLog = (stage: string, message: string) => {
      logs.push({
        timestamp: new Date().toISOString(),
        stage,
        message,
      });
    };

    // Step 1: Receive campaign ID and retrieve campaign data
    addLog('Campaign received', `Received campaign ID: ${campaignId}`);
    const campaign = await campaignsRepository.readDocument(campaignId);
    if (!campaign) {
      addLog('Failed', `Campaign with ID ${campaignId} was not found in Firestore.`);
      return {
        campaignId,
        campaignTitle: 'Unknown Campaign',
        normalizedSpec: {} as NormalizedCampaignSpec,
        candidatesAnalyzed: 0,
        recommendations: [],
        logs,
        completedAt: new Date().toISOString(),
        status: 'failed',
        statusMessage: `Campaign ${campaignId} not found. Please select an existing campaign.`,
      };
    }

    // Step 2: Campaign Agent interpretation & normalization
    addLog(
      'Campaign interpreted',
      `Interpreting campaign "${campaign.title}" (${campaign.category})`
    );

    let spec: NormalizedCampaignSpec;
    if (campaign.normalizedSpec) {
      spec = campaign.normalizedSpec;
    } else {
      spec = buildNormalizedCampaignSpec({
        campaign_name: campaign.title,
        campaign_description: campaign.description,
        category: campaign.category,
        product_or_service: campaign.productOrService,
        objective: campaign.objective,
        budget: campaign.budget,
        currency: campaign.currency,
        target_audience: `${campaign.audienceAgeRange} · ${campaign.audienceGender}`,
        locations: campaign.targetLocations,
        platforms: campaign.platforms,
        niches: campaign.preferredNiches,
        creator_types: campaign.creatorTypes,
        minimum_followers: campaign.minimumFollowers,
        deliverables: campaign.deliverables,
        languages: campaign.languages,
      });

      // Persist normalized spec to campaign record
      await campaignsRepository.updateDocument(campaignId, {
        normalizedSpec: spec,
        agentAnalyzedAt: new Date().toISOString(),
      });
    }

    // Step 3 & 4: Creator Intelligence Agent (retrieve & deterministically filter candidates)
    addLog(
      'Candidates retrieved',
      `Querying creator pool across ${spec.niches.join(', ')} niches and ${spec.platforms.join(', ')} platforms`
    );

    const candidates = await CreatorIntelligenceAgent.filter_creators(spec);
    addLog(
      'Candidates filtered',
      `Retrieved ${candidates.length} compatible candidates using deterministic filtering (UGC follower rules respected)`
    );

    if (candidates.length === 0) {
      addLog('Completed', 'No compatible creators found for the given criteria.');
      return {
        campaignId,
        campaignTitle: campaign.title,
        normalizedSpec: spec,
        candidatesAnalyzed: 0,
        recommendations: [],
        logs,
        completedAt: new Date().toISOString(),
        status: 'empty',
        statusMessage:
          'No creator candidates matched all deterministic filters. Try broadening target cities, platforms, or niches.',
      };
    }

    // Step 5: Matching Agent (semantic qualitative evaluation)
    addLog(
      'Matching started',
      `Evaluating ${candidates.length} candidates against campaign requirements`
    );

    const evaluations = await MatchingAgent.evaluateCandidates(spec, candidates);
    addLog(
      'Recommendations generated',
      `Scored ${evaluations.length} creators across qualitative fit dimensions`
    );

    // Sort by match score descending and take up to 5 top recommendations (Module 10)
    evaluations.sort((a, b) => b.matchScore - a.matchScore);
    const topEvaluations = evaluations.slice(0, 5);

    // Map to Recommendation documents
    const now = new Date().toISOString();
    const finalRecommendations: Recommendation[] = [];

    for (const evalItem of topEvaluations) {
      const candidateInfo = candidates.find((c) => c.creatorId === evalItem.creatorId);
      if (!candidateInfo) continue;

      const recId = `rec-${campaign.id}-${evalItem.creatorId}`;
      const recDoc: Recommendation = {
        id: recId,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        businessId: campaign.businessId,
        creatorId: candidateInfo.creatorId,
        creatorName: candidateInfo.name,
        creatorHandle: candidateInfo.handle,
        creatorType: candidateInfo.creatorType,
        creatorLocation: candidateInfo.location,
        primaryNiche: candidateInfo.primaryNiche,
        platforms: candidateInfo.platforms,
        followers: candidateInfo.followers,
        averageViews: candidateInfo.averageViews,
        engagementRate: candidateInfo.engagementRate,
        estimatedRatePKR: candidateInfo.startingRatePKR,
        matchScore: evalItem.matchScore,
        whyThisCreator:
          evalItem.why_this_creator[0] ||
          `${candidateInfo.name} aligns with ${campaign.title} in ${candidateInfo.primaryNiche}.`,
        whyThisCreatorBullets: evalItem.why_this_creator,
        strengths: evalItem.strengths,
        considerations: evalItem.considerations,
        matchedCriteria: candidateInfo.retrievalReasons,
        services: candidateInfo.services,
        status: 'recommended',
        createdAt: now,
        updatedAt: now,
        isDemo: true,
        demoLabel: 'Fictional Demo Recommendation',
      };

      // Save to Firestore recommendations collection
      await recommendationsRepository.createDocument(recDoc);
      finalRecommendations.push(recDoc);
    }

    addLog(
      'Recommendations saved',
      `Saved ${finalRecommendations.length} recommendations to Firestore`
    );

    return {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      normalizedSpec: spec,
      candidatesAnalyzed: candidates.length,
      recommendations: finalRecommendations,
      logs,
      completedAt: new Date().toISOString(),
      status: 'succeeded',
      statusMessage: `Successfully analyzed ${candidates.length} candidates and generated ${finalRecommendations.length} recommendations.`,
    };
  }

  // ==========================================
  // MODULE 17 — REUSABLE AGENT TOOL DEFINITIONS
  // ==========================================

  /**
   * Tool: get_campaign
   */
  static async get_campaign(campaignId: string): Promise<Campaign | null> {
    return campaignsRepository.readDocument(campaignId);
  }

  /**
   * Tool: search_creators
   */
  static async search_creators(keyword: string) {
    return CreatorIntelligenceAgent.search_creators(keyword);
  }

  /**
   * Tool: filter_creators
   */
  static async filter_creators(spec: NormalizedCampaignSpec) {
    return CreatorIntelligenceAgent.filter_creators(spec);
  }

  /**
   * Tool: get_creator_profile
   */
  static async get_creator_profile(creatorId: string) {
    return CreatorIntelligenceAgent.get_creator_profile(creatorId);
  }

  /**
   * Tool: get_creator_packages
   */
  static async get_creator_packages(creatorId: string) {
    return CreatorIntelligenceAgent.get_creator_packages(creatorId);
  }

  /**
   * Tool: save_recommendations
   */
  static async save_recommendations(
    campaignId: string,
    recommendations: Recommendation[]
  ): Promise<void> {
    for (const rec of recommendations) {
      await recommendationsRepository.createDocument(rec);
    }
  }
}
