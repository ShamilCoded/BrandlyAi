'use client';

/**
 * MODULE 10 — AI RECOMMENDATION EXPERIENCE
 * Header: Campaign name, objective, budget, target market, platforms, preferred creator type/niche.
 * Processing stages:
 * - Understanding campaign
 * - Finding relevant creators
 * - Evaluating creator fit
 * - Preparing recommendations
 * Shows number of creators analyzed, up to 5 recommendations with match score,
 * "Why this creator?" factual bullets, strengths, considerations, services, and CTAs.
 * Transparent disclaimer: Match score is a decision support signal, not a prediction of business results.
 * Modern dark UI matching Brandly.ai design language.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Eye,
  Send,
  Scale,
  CheckCircle2,
  SlidersHorizontal,
  ShieldCheck,
  Building,
  Plus,
} from 'lucide-react';
import { useAppState } from '@/lib/context/app-state-context';
import { EmptyState } from '@/components/ui/empty-state';
import type {
  Campaign,
  Creator,
  OrchestrationLog,
  OrchestrationResult,
  Recommendation,
} from '@/lib/types/domain';

interface RecommendationViewProps {
  onViewCreatorProfile: (creatorId: string) => void;
  onOpenProposalModal: (creator: Creator, campaignId: string) => void;
  onGeneratePitch?: (creator: Creator, campaignId: string) => void;
  onToggleCompare: (creatorId: string) => void;
  comparedCreatorIds: string[];
  onCreateCampaign?: () => void;
}

export function RecommendationView({
  onViewCreatorProfile,
  onOpenProposalModal,
  onGeneratePitch,
  onToggleCompare,
  comparedCreatorIds,
  onCreateCampaign,
}: RecommendationViewProps) {
  const {
    businessCampaigns,
    businessRecommendations,
    creators,
    runMatchingOrchestration,
  } = useAppState();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(() => {
    return businessCampaigns[0]?.id || '';
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [orchestrationResult, setOrchestrationResult] =
    useState<OrchestrationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize selectedCampaignId whenever businessCampaigns changes
  React.useEffect(() => {
    if (!businessCampaigns.some((c) => c.id === selectedCampaignId)) {
      if (businessCampaigns.length > 0) {
        setSelectedCampaignId(businessCampaigns[0].id);
        setOrchestrationResult(null);
        setErrorMsg(null);
      } else {
        setSelectedCampaignId('');
      }
    }
  }, [businessCampaigns, selectedCampaignId]);

  const selectedCampaign: Campaign | undefined = businessCampaigns.find(
    (c) => c.id === selectedCampaignId
  );

  const relevantRecommendations: Recommendation[] = (
    orchestrationResult?.recommendations ||
    businessRecommendations.filter((r) => r.campaignId === selectedCampaignId)
  ).slice(0, 5);

  const stages = [
    { title: 'Understanding campaign', desc: 'Normalizing brief and parameters' },
    { title: 'Finding relevant creators', desc: 'Deterministic candidate filtering' },
    { title: 'Evaluating creator fit', desc: 'Multi-signal semantic evaluation' },
    { title: 'Preparing recommendations', desc: 'Synthesizing decision support data' },
  ];

  const handleRunOrchestration = async (campId: string) => {
    if (!campId) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setCurrentStageIndex(0);

    const stageTimer1 = setTimeout(() => setCurrentStageIndex(1), 350);
    const stageTimer2 = setTimeout(() => setCurrentStageIndex(2), 700);
    const stageTimer3 = setTimeout(() => setCurrentStageIndex(3), 1100);

    try {
      const res = await runMatchingOrchestration(campId);
      setOrchestrationResult(res);
      if (res.status === 'failed') {
        setErrorMsg(res.statusMessage);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Orchestration workflow failed.'
      );
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Context Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Matching · Decision Support</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-['Syne',sans-serif]">
              AI Creator Recommendations
            </h1>
            <p className="text-xs text-slate-400">
              Evaluates creator fit against campaign goals, audience, and content requirements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {businessCampaigns.length > 0 ? (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-400">
                  Campaign:
                </label>
                <select
                  aria-label="Select Campaign"
                  value={selectedCampaignId}
                  onChange={(e) => {
                    setSelectedCampaignId(e.target.value);
                    setOrchestrationResult(null);
                    setErrorMsg(null);
                  }}
                  className="text-xs font-semibold text-white bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  {businessCampaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {onCreateCampaign && (
              <button
                type="button"
                onClick={onCreateCampaign}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>New Campaign</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleRunOrchestration(selectedCampaignId)}
              disabled={isProcessing || !selectedCampaignId}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Analyzing Candidates...' : 'Run AI Matching'}</span>
            </button>
          </div>
        </div>

        {selectedCampaign && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs font-medium text-slate-400 block">Campaign Name</span>
              <span className="font-semibold text-white truncate block mt-0.5">
                {selectedCampaign.title}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block">Objective</span>
              <span className="font-semibold text-white truncate block mt-0.5">
                {selectedCampaign.objective}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block">Budget</span>
              <span className="font-semibold font-mono tabular-nums text-emerald-400 block mt-0.5">
                {selectedCampaign.currency} {selectedCampaign.budget.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block">Target Markets</span>
              <span className="font-semibold text-white truncate block mt-0.5">
                {selectedCampaign.targetLocations.join(', ')}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block">Platforms</span>
              <span className="font-semibold text-indigo-300 truncate block mt-0.5">
                {selectedCampaign.platforms.join(' · ')}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block">Type / Niche</span>
              <span className="font-semibold text-white truncate block mt-0.5">
                {selectedCampaign.preferredNiches[0] || 'Technology'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Processing State */}
      {isProcessing && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Orchestrator Agent Workflow in Progress
            </h3>
            <p className="text-sm text-slate-300">
              Retrieving creator candidates, evaluating multi-signal fit, and synthesizing recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto pt-2">
            {stages.map((st, idx) => {
              const isActive = idx === currentStageIndex;
              const isPast = idx < currentStageIndex;
              return (
                <div
                  key={st.title}
                  className={`p-4 rounded-xl border text-left text-sm transition-colors ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : isPast
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono tabular-nums text-xs font-semibold">
                    <span>0{idx + 1}</span>
                    {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="font-bold mt-2 text-white text-sm">{st.title}</div>
                  <div className={`mt-1 text-xs ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {st.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error State */}
      {errorMsg && !isProcessing && (
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-200">Matching Workflow Notice</div>
              <div className="mt-0.5">{errorMsg}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRunOrchestration(selectedCampaignId)}
            className="px-4 py-2 font-semibold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
          >
            Retry Matching
          </button>
        </div>
      )}

      {/* Empty States */}
      {!isProcessing && businessCampaigns.length === 0 && (
        <EmptyState
          icon={Sparkles}
          badge="AI Matching"
          title="No Campaigns Created Yet"
          description="Create your first campaign brief with target audience, platforms, and deliverables in PKR to generate tailored AI creator recommendations."
          action={
            onCreateCampaign
              ? {
                  label: 'Create Campaign Now',
                  onClick: onCreateCampaign,
                  icon: Plus,
                }
              : undefined
          }
        />
      )}

      {!isProcessing && businessCampaigns.length > 0 && relevantRecommendations.length === 0 && !errorMsg && (
        <EmptyState
          icon={Sparkles}
          badge="Decision Support"
          title="No AI Recommendations Generated Yet"
          description="Click 'Run AI Matching' to analyze creator candidates from the marketplace database against this campaign's target audience and deliverable requirements."
          action={{
            label: 'Run AI Matching Now',
            onClick: () => handleRunOrchestration(selectedCampaignId),
            icon: Sparkles,
          }}
        />
      )}

      {/* Recommendation Results (Up to 5 Creators) */}
      {!isProcessing && relevantRecommendations.length > 0 && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-sm">
            <div className="text-slate-300">
              <strong className="text-white font-semibold">
                {orchestrationResult?.candidatesAnalyzed || 18} candidates analyzed
              </strong>{' '}
              · Showing top {relevantRecommendations.length} recommendations ·{' '}
              <span className="text-amber-400/90 font-mono text-xs">Fictional Demo Metrics</span>
            </div>

            <div className="text-slate-400 text-xs flex items-center gap-1.5">
              <span>Decision Support Signal</span>
              <span aria-hidden="true">·</span>
              <span>Match score does not predict commercial sales</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {relevantRecommendations.map((rec, index) => {
              const fullCreator = creators.find((c) => c.id === rec.creatorId);
              const isCompared = comparedCreatorIds.includes(rec.creatorId);
              const isUgc = rec.creatorType === 'UGC Creator';

              return (
                <div
                  key={rec.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5 transition-all hover:border-slate-700"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                          Match #{index + 1}
                        </span>
                        <span>{rec.creatorType}</span>
                        <span>•</span>
                        <span>{rec.creatorLocation}, Pakistan</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {rec.creatorName}{' '}
                        <span className="text-sm font-normal text-slate-400">
                          ({rec.creatorHandle})
                        </span>
                      </h3>
                      <div className="text-sm text-slate-300">
                        Primary Niche: <span className="text-indigo-300 font-semibold">{rec.primaryNiche}</span> · Platforms:{' '}
                        {rec.platforms.join(' & ')}
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">Match Score:</span>
                        <span className="text-2xl font-black font-mono tabular-nums text-white">
                          {rec.matchScore}/100
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400 mt-0.5">
                        {rec.matchScore >= 90 ? 'Highly Recommended' : 'Strong Match'}
                      </span>
                    </div>
                  </div>

                  {/* Stored Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm font-mono tabular-nums">
                    <div>
                      <span className="text-slate-400 font-sans block text-xs font-medium">
                        {isUgc ? 'Followers (UGC)' : 'Followers'}
                      </span>
                      <span className="font-bold text-white text-base mt-0.5 block">
                        {rec.followers > 0 ? rec.followers.toLocaleString() : 'N/A (UGC)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans block text-xs font-medium">Average Views</span>
                      <span className="font-bold text-white text-base mt-0.5 block">
                        {rec.averageViews.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans block text-xs font-medium">Engagement Rate</span>
                      <span className="font-bold text-indigo-400 text-base mt-0.5 block">
                        {rec.engagementRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans block text-xs font-medium">Starting Rate</span>
                      <span className="font-bold text-emerald-400 text-base mt-0.5 block">
                        PKR {rec.estimatedRatePKR.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Why This Creator (Factual Bullet List) */}
                  <div className="space-y-2.5">
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Why this creator?</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-slate-300 list-disc list-inside">
                      {(rec.whyThisCreatorBullets && rec.whyThisCreatorBullets.length > 0
                        ? rec.whyThisCreatorBullets
                        : [rec.whyThisCreator]
                      ).map((bullet, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Services & Strengths */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2 border-t border-slate-800">
                    <div>
                      <span className="font-semibold text-white block mb-1">
                        Available Services
                      </span>
                      <span className="text-slate-300">
                        {rec.services.join(' · ')}
                      </span>
                    </div>
                    {rec.strengths && rec.strengths.length > 0 && (
                      <div>
                        <span className="font-semibold text-white block mb-1">
                          Key Strengths
                        </span>
                        <span className="text-slate-300">
                          {rec.strengths.join('; ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <div className="text-xs text-slate-400">
                      Evaluated on genuine stored profile fields
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onToggleCompare(rec.creatorId)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                          isCompared
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        <Scale className="w-4 h-4" />
                        <span>{isCompared ? 'Compared' : 'Compare Creators'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewCreatorProfile(rec.creatorId)}
                        className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Profile</span>
                      </button>

                      {fullCreator && onGeneratePitch && (
                        <button
                          type="button"
                          onClick={() =>
                            onGeneratePitch(fullCreator, rec.campaignId)
                          }
                          className="px-4 py-2 text-sm font-semibold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span>Generate Pitch</span>
                        </button>
                      )}

                      {fullCreator && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenProposalModal(fullCreator, rec.campaignId)
                          }
                          className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          <span>Send Proposal</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
