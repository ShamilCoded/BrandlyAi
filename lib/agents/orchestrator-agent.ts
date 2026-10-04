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
  AgentActivityStep,
  AgentId,
  AgentStatus,
  Campaign,
  NormalizedCampaignSpec,
  OrchestrationLog,
  OrchestrationResult,
  OrchestratorProgressEvent,
  Recommendation,
} from '@/lib/types/domain';

export class OrchestratorAgent {
  /**
   * Primary Application Service: findCreatorRecommendations(campaignId, onProgress)
   */
  static async findCreatorRecommendations(
    campaignId: string,
    onProgress?: (event: OrchestratorProgressEvent) => void
  ): Promise<OrchestrationResult> {
    const logs: OrchestrationLog[] = [];
    const addLog = (stage: string, message: string) => {
      logs.push({
        timestamp: new Date().toISOString(),
        stage,
        message,
      });
    };

    const steps: AgentActivityStep[] = [
      {
        agentId: 'campaign_agent',
        name: 'Campaign Agent',
        title: 'Campaign Requirements Analysis',
        status: 'pending',
        description: 'Analyzing campaign brief & normalizing target criteria',
      },
      {
        agentId: 'creator_intelligence_agent',
        name: 'Creator Intelligence Agent',
        title: 'Candidate Search & Filtering',
        status: 'pending',
        description: 'Searching and filtering relevant creators (UGC rules applied)',
      },
      {
        agentId: 'matching_agent',
        name: 'Matching Agent',
        title: 'Multi-Signal Semantic Evaluation',
        status: 'pending',
        description: 'Evaluating campaign-to-creator fit across qualitative dimensions',
      },
      {
        agentId: 'orchestrator_agent',
        name: 'Orchestrator',
        title: 'Recommendation Synthesis',
        status: 'pending',
        description: 'Preparing final recommendations and decision support data',
      },
    ];

    const emitStep = (
      agentId: AgentId,
      status: AgentStatus,
      detail?: string,
      durationMs?: number
    ) => {
      const idx = steps.findIndex((s) => s.agentId === agentId);
      if (idx !== -1) {
        steps[idx] = {
          ...steps[idx],
          status,
          detail: detail !== undefined ? detail : steps[idx].detail,
          timestamp: new Date().toISOString(),
          durationMs: durationMs !== undefined ? durationMs : steps[idx].durationMs,
        };
        onProgress?.({
          currentAgent: agentId,
          step: { ...steps[idx] },
          steps: steps.map((s) => ({ ...s })),
        });
      }
    };

    // Step 1: Receive campaign ID and retrieve campaign data
    addLog('Campaign received', `Received campaign ID: ${campaignId}`);
    const campaign = await campaignsRepository.readDocument(campaignId);
    if (!campaign) {
      addLog('Failed', `Campaign with ID ${campaignId} was not found in Firestore.`);
      emitStep('campaign_agent', 'failed', `Campaign ${campaignId} not found`);
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
        agentSteps: steps,
      };
    }

    // Step 2: Campaign Agent interpretation & normalization
    emitStep(
      'campaign_agent',
      'running',
      `Analyzing brief for "${campaign.title}" (${campaign.category})...`
    );
    const tCampaignStart = Date.now();
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

    const campaignDuration = Date.now() - tCampaignStart;
    emitStep(
      'campaign_agent',
      'completed',
      `Brief normalized: ${spec.creator_types.join(', ')} · ${spec.platforms.join(' & ')} · ${spec.niches.join(', ')}`,
      campaignDuration
    );

    // Step 3 & 4: Creator Intelligence Agent (retrieve & deterministically filter candidates)
    emitStep(
      'creator_intelligence_agent',
      'running',
      `Searching creator pool across ${spec.niches.join(', ')} niches and ${spec.platforms.join(', ')} platforms...`
    );
    const tCreatorStart = Date.now();
    addLog(
      'Candidates retrieved',
      `Querying creator pool across ${spec.niches.join(', ')} niches and ${spec.platforms.join(', ')} platforms`
    );

    const candidates = await CreatorIntelligenceAgent.filter_creators(spec);
    const creatorDuration = Date.now() - tCreatorStart;
    addLog(
      'Candidates filtered',
      `Retrieved ${candidates.length} compatible candidates using deterministic filtering (UGC follower rules respected)`
    );

    emitStep(
      'creator_intelligence_agent',
      'completed',
      `${candidates.length} compatible candidates retrieved via deterministic filtering`,
      creatorDuration
    );

    if (candidates.length === 0) {
      addLog('Completed', 'No compatible creators found for the given criteria.');
      emitStep(
        'matching_agent',
        'completed',
        'Skipped: 0 candidates matched deterministic criteria'
      );
      emitStep(
        'orchestrator_agent',
        'completed',
        'Completed with 0 recommendations'
      );
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
        agentSteps: steps,
      };
    }

    // Step 5: Matching Agent (semantic qualitative evaluation)
    emitStep(
      'matching_agent',
      'running',
      `Evaluating ${candidates.length} candidates across niche relevance, audience fit, and deliverable capability...`
    );
    const tMatchingStart = Date.now();
    addLog(
      'Matching started',
      `Evaluating ${candidates.length} candidates against campaign requirements`
    );

    const evaluations = await MatchingAgent.evaluateCandidates(spec, candidates);
    const matchingDuration = Date.now() - tMatchingStart;
    addLog(
      'Recommendations generated',
      `Scored ${evaluations.length} creators across qualitative fit dimensions`
    );

    emitStep(
      'matching_agent',
      'completed',
      `Scored and ranked ${evaluations.length} creators with multi-signal fit evaluation`,
      matchingDuration
    );

    // Step 6: Orchestrator synthesis & saving
    emitStep(
      'orchestrator_agent',
      'running',
      `Selecting top 5 matches and persisting recommendation records to Firestore...`
    );
    const tOrchestratorStart = Date.now();

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

    const orchestratorDuration = Date.now() - tOrchestratorStart;
    emitStep(
      'orchestrator_agent',
      'completed',
      `${finalRecommendations.length} top recommendations ready with decision support signals`,
      orchestratorDuration
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
      agentSteps: steps,
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
