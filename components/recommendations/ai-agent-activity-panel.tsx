'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Circle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Search,
  Target,
  Sliders,
  Clock,
  RefreshCw,
} from 'lucide-react';
import type { AgentActivityStep, AgentId, AgentStatus } from '@/lib/types/domain';

interface AiAgentActivityPanelProps {
  steps: AgentActivityStep[];
  isProcessing: boolean;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'empty';
  statusMessage?: string;
  recommendationsCount?: number;
  onRetry?: () => void;
  defaultExpanded?: boolean;
}

const AGENT_META: Record<
  AgentId,
  {
    icon: React.ElementType;
    badge: string;
    accentColor: string;
    stepNumber: string;
  }
> = {
  campaign_agent: {
    icon: Zap,
    badge: 'Brief Parser',
    accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    stepNumber: '01',
  },
  creator_intelligence_agent: {
    icon: Search,
    badge: 'Database Filter',
    accentColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    stepNumber: '02',
  },
  matching_agent: {
    icon: Target,
    badge: 'Semantic Evaluator',
    accentColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    stepNumber: '03',
  },
  orchestrator_agent: {
    icon: Sliders,
    badge: 'Synthesizer',
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    stepNumber: '04',
  },
};

export function AiAgentActivityPanel({
  steps,
  isProcessing,
  status,
  statusMessage,
  recommendationsCount = 0,
  onRetry,
  defaultExpanded = true,
}: AiAgentActivityPanelProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const runningStep = steps.find((s) => s.status === 'running');
  const failedStep = steps.find((s) => s.status === 'failed');

  const totalDurationMs = steps.reduce(
    (acc, s) => acc + (s.durationMs || 0),
    0
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all"
    >
      {/* Panel Top Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
              isProcessing
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 shadow-md shadow-indigo-500/20'
                : status === 'completed'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : status === 'failed'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isProcessing ? (
              <Sparkles className="w-5 h-5 animate-pulse text-indigo-400" />
            ) : status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : status === 'failed' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-['Syne',sans-serif] tracking-tight">
                {isProcessing
                  ? '✦ Brandly AI is working'
                  : status === 'completed'
                  ? '✓ AI Analysis Complete'
                  : status === 'failed'
                  ? '✕ Multi-Agent Matching Notice'
                  : 'Brandly Multi-Agent Architecture'}
              </h2>

              {isProcessing && runningStep && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 animate-pulse flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  {runningStep.name} active
                </span>
              )}

              {status === 'completed' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  {recommendationsCount} top recommendation{recommendationsCount === 1 ? '' : 's'} ready
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {isProcessing
                ? 'Coordinating Campaign Agent, Creator Intelligence Agent, and Matching Agent...'
                : status === 'completed'
                ? `Synthesized across ${completedCount} agent milestones · Total pipeline time: ${(totalDurationMs / 1000).toFixed(1)}s`
                : statusMessage || 'Multi-agent orchestration pipeline for creator-campaign fit.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {status === 'failed' && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3.5 py-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Matching</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide Steps' : 'View Agent Steps'}</span>
            <span className="text-slate-400 font-mono">({completedCount}/4)</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Step-by-Step Agent Pipeline View */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-3.5 bg-slate-900/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {steps.map((step) => {
              const meta = AGENT_META[step.agentId] || AGENT_META.orchestrator_agent;
              const Icon = meta.icon;

              const isStepRunning = step.status === 'running';
              const isStepCompleted = step.status === 'completed';
              const isStepFailed = step.status === 'failed';
              const isStepPending = step.status === 'pending';

              return (
                <div
                  key={step.agentId}
                  className={`p-4 rounded-xl border transition-all ${
                    isStepRunning
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                      : isStepCompleted
                      ? 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                      : isStepFailed
                      ? 'bg-rose-950/30 border-rose-900/50'
                      : 'bg-slate-950/40 border-slate-850/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* Status Indicator Icon */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isStepRunning
                            ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                            : isStepCompleted
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isStepFailed
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800/60 text-slate-500 border border-slate-700/60'
                        }`}
                      >
                        {isStepRunning ? (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        ) : isStepCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isStepFailed ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-slate-400" />
                            {step.name}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${meta.accentColor}`}
                          >
                            {meta.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
                      {step.durationMs !== undefined && step.durationMs > 0 ? (
                        <span className="flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {step.durationMs > 999
                            ? `${(step.durationMs / 1000).toFixed(1)}s`
                            : `${step.durationMs}ms`}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-semibold">
                          {meta.stepNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Real Execution Detail Box */}
                  {step.detail && (
                    <div
                      className={`mt-3 pt-2.5 border-t text-xs leading-relaxed ${
                        isStepRunning
                          ? 'border-indigo-500/20 text-indigo-200'
                          : isStepCompleted
                          ? 'border-slate-800 text-slate-300'
                          : isStepFailed
                          ? 'border-rose-900/40 text-rose-300'
                          : 'border-slate-800/60 text-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <span
                          className={`font-mono text-[10px] mt-0.5 shrink-0 ${
                            isStepRunning ? 'text-indigo-400' : 'text-slate-500'
                          }`}
                        >
                          ↳
                        </span>
                        <span className="break-words font-medium text-[11.5px]">
                          {step.detail}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pipeline Legend Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-400 border-t border-slate-800/60 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Deterministic Filtering + Semantic Scoring</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:inline">No fabricated creator metrics</span>
            </div>

            <div className="text-slate-500">
              Pipeline: Brief → Filtering → Fit Scoring → Decision Support
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
