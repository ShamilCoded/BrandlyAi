'use client';

/**
 * MODULE 12 — CREATOR COMPARISON VIEW
 * Compares up to 3 creators simultaneously.
 * Shows:
 * - Creator, Creator type, Location, Platforms
 * - Followers, Average views, Engagement rate
 * - Primary niche, Secondary niches, Languages
 * - Services, Packages, Pricing, Availability
 * - Campaign-specific match score, Why this creator, Strengths, Considerations
 *
 * CRITICAL UX PRINCIPLE:
 * Never declares a universal "winner". Presents campaign-specific information so the business
 * can make its own decision.
 * Styled with Brandly.ai dark aesthetic.
 */

import React from 'react';
import { ArrowLeft, X, Send, Eye, CheckCircle2, AlertCircle, Scale, Sparkles, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import type { Creator, CreatorPackage, Recommendation } from '@/lib/types/domain';

interface CreatorComparisonViewProps {
  creatorsToCompare: Creator[];
  packages: CreatorPackage[];
  recommendations: Recommendation[];
  onRemoveCreator: (creatorId: string) => void;
  onClearAll: () => void;
  onViewProfile: (creatorId: string) => void;
  onOpenProposal: (creator: Creator) => void;
  onBack: () => void;
}

export function CreatorComparisonView({
  creatorsToCompare,
  packages,
  recommendations,
  onRemoveCreator,
  onClearAll,
  onViewProfile,
  onOpenProposal,
  onBack,
}: CreatorComparisonViewProps) {
  if (creatorsToCompare.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        badge="Comparison"
        title="No Creators Selected for Comparison"
        description="Select up to 3 creators from the Creator Directory or AI Matching view to compare engagement, audience, pricing, and campaign fit side-by-side."
        action={{
          label: 'Browse Creator Directory',
          onClick: onBack,
          icon: Users,
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Creator Directory</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-['Syne',sans-serif]">
            Side-by-Side Creator Comparison ({creatorsToCompare.length}/3)
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Objective evaluation based on stored data. Brandly.ai provides decision support
            without declaring an artificial universal winner.
          </p>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="text-sm font-semibold text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 bg-slate-800/80 px-4 py-2 rounded-lg self-start sm:self-auto cursor-pointer transition-colors"
        >
          Clear Comparison
        </button>
      </div>

      {/* Comparison Grid */}
      <div
        className={`grid grid-cols-1 ${
          creatorsToCompare.length === 1
            ? 'md:grid-cols-2'
            : creatorsToCompare.length === 2
            ? 'md:grid-cols-2 lg:grid-cols-3'
            : 'md:grid-cols-3'
        } gap-6`}
      >
        {creatorsToCompare.map((c) => {
          const matchingRec = recommendations.find((r) => r.creatorId === c.id);
          const creatorPackages = packages.filter((p) => p.creatorId === c.id);
          const isUgc = c.creatorType === 'UGC Creator';

          const fitPosture = isUgc
            ? 'UGC-focused content capability'
            : c.followers >= 50000
            ? 'Broader audience reach'
            : c.engagementRate >= 6.0
            ? 'High community engagement'
            : 'Strong niche alignment';

          return (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6"
            >
              {/* Creator Card Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-indigo-400">
                      {c.creatorType} · {c.location}
                    </span>
                    <h2 className="text-xl font-bold text-white font-['Syne',sans-serif]">
                      {c.name}
                    </h2>
                    <span className="text-sm text-slate-300 block">
                      {c.handle} · {c.platforms.join(' & ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveCreator(c.id)}
                    aria-label={`Remove ${c.name} from comparison`}
                    className="p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Comparison Badge */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm">
                  <span className="text-slate-400 block text-xs font-medium">Core Profile Orientation:</span>
                  <span className="font-semibold text-indigo-300 mt-0.5 block">
                    {fitPosture}
                  </span>
                </div>

                {/* Match Score if present */}
                {matchingRec && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm flex items-center justify-between">
                    <div>
                      <span className="text-white font-semibold block flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        Campaign Match Score
                      </span>
                      <span className="text-indigo-300 text-xs">
                        Decision Support Signal
                      </span>
                    </div>
                    <span className="text-xl font-extrabold font-mono tabular-nums text-white">
                      {matchingRec.matchScore}/100
                    </span>
                  </div>
                )}

                {/* Performance Metrics Table */}
                <div className="space-y-2.5 text-sm border-t border-slate-800 pt-3">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">
                      {isUgc ? 'Followers (UGC)' : 'Followers'}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-white">
                      {c.followers > 0 ? c.followers.toLocaleString() : 'N/A (UGC)'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Average Views</span>
                    <span className="font-mono tabular-nums font-bold text-white">
                      {c.averageViews.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Engagement Rate</span>
                    <span className="font-mono tabular-nums font-bold text-indigo-400">
                      {c.engagementRate}%
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Starting Rate</span>
                    <span className="font-mono tabular-nums font-bold text-emerald-400">
                      PKR {c.startingRatePKR.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Availability</span>
                    <span className="font-medium text-slate-200">
                      {c.availability} ({c.turnaroundDays}d turnaround)
                    </span>
                  </div>
                </div>

                {/* Niches, Platforms, Languages */}
                <div className="space-y-2 text-sm pt-1">
                  <div>
                    <strong className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Primary Niche:</strong>{' '}
                    <span className="text-slate-200 font-semibold">{c.primaryNiche}</span>
                  </div>

                  <div>
                    <strong className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Secondary Niches:</strong>{' '}
                    <span className="text-slate-200 font-medium">
                      {c.secondaryNiches.join(', ') || 'None specified'}
                    </span>
                  </div>

                  <div>
                    <strong className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Languages:</strong>{' '}
                    <span className="text-slate-200 font-medium">{c.languages.join(' · ')}</span>
                  </div>
                </div>

                {/* Packages count */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm">
                  <span className="text-slate-400 block text-xs font-medium">Available Packages:</span>
                  <span className="font-semibold text-white">
                    {creatorPackages.length} package options listed
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onViewProfile(c.id)}
                  className="w-full py-2.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenProposal(c)}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Proposal</span>
                </button>
              </div>
            </div>
          );
        })}

        {creatorsToCompare.length < 3 && (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Add Another Creator ({creatorsToCompare.length}/3)
              </h3>
              <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
                Select another creator from the directory or AI recommendations to compare side-by-side.
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Browse Creators</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
