import type {
  CampaignAgentInput,
  NormalizedCampaignSpec,
  CreatorCandidate,
  CreatorMatchEvaluation,
  Recommendation,
  OrchestrationLog,
  OrchestratorStage,
} from '@/lib/types/domain';

export interface AgentResponseEnvelope<T> {
  agentName:
    | 'CampaignAgent'
    | 'CreatorIntelligenceAgent'
    | 'MatchingAgent'
    | 'OrchestratorAgent';
  status: 'succeeded' | 'fallback_validated' | 'failed';
  data: T;
  conciseExplanation: string;
  processedAt: string;
  schemaValid: boolean;
  validationWarnings?: string[];
  logs?: OrchestrationLog[];
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
