'use client';

/**
 * MODULE 11 — CREATOR PROFILE VIEW
 * Loaded dynamically from Firestore:
 * - Header: Name, Creator Type, Location, Platforms, Primary/Secondary Niches
 * - Audience / Performance: Followers, Average Views, Engagement Rate (labeled fictional demo data)
 * - Services: Reel, TikTok Video, Story, Product Review, UGC Video, Photography
 * - Packages: Name, Deliverables, Price (PKR), Estimated Timeline, Notes
 * - Portfolio: Demo portfolio structures without fake external links
 * - Additional Info: Languages, Availability, Previous Campaign Categories
 * - CTAs: Compare, Send Proposal
 * Styled with Brandly.ai dark aesthetic.
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Scale,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  Layers,
  Sparkles,
  Building,
  MapPin,
} from 'lucide-react';
import { MarketplaceService } from '@/lib/services/marketplace-service';
import type { Creator, CreatorPackage } from '@/lib/types/domain';

interface CreatorProfileViewProps {
  creatorId: string;
  onBack: () => void;
  onOpenProposalModal: (creator: Creator) => void;
  onGeneratePitch?: (creator: Creator) => void;
  onToggleCompare: (creatorId: string) => void;
  isCompared: boolean;
}

export function CreatorProfileView({
  creatorId,
  onBack,
  onOpenProposalModal,
  onGeneratePitch,
  onToggleCompare,
  isCompared,
}: CreatorProfileViewProps) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [packages, setPackages] = useState<CreatorPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    MarketplaceService.getCreatorDetails(creatorId)
      .then(({ creator: c, packages: p }) => {
        if (isMounted) {
          setCreator(c);
          setPackages(p);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [creatorId]);

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400 space-y-2">
        <p>Loading creator profile from Firestore...</p>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <p className="text-sm text-slate-300">Creator profile not found.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 cursor-pointer"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const isUgc = creator.creatorType === 'UGC Creator';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2 self-start cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Creators Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleCompare(creator.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              isCompared
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{isCompared ? 'Compared' : 'Compare Creators'}</span>
          </button>

          {onGeneratePitch && (
            <button
              type="button"
              onClick={() => onGeneratePitch(creator)}
              className="px-4 py-2 text-sm font-semibold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Generate Pitch</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenProposalModal(creator)}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Send Proposal</span>
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-bold font-['Syne',sans-serif] shrink-0 shadow-lg shadow-indigo-600/20">
              {creator.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold">
                  {creator.creatorType}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {creator.location}, Pakistan
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400/90 font-mono text-xs">
                  {creator.demoLabel || 'Fictional Demo Creator'}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white font-['Syne',sans-serif]">
                {creator.name}
              </h1>
              <p className="text-sm text-slate-300">
                {creator.handle} · Platforms: {creator.platforms.join(' & ')}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono tabular-nums">
            <div className="text-xs text-slate-400 font-medium font-sans">Starting Package Rate</div>
            <div className="text-2xl font-extrabold text-emerald-400">
              PKR {creator.startingRatePKR.toLocaleString()}
            </div>
            <div className="text-sm text-indigo-300 font-sans mt-0.5">
              Status: {creator.availability} · {creator.turnaroundDays}-day turnaround
            </div>
          </div>
        </div>

        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          {creator.bio}
        </p>

        {/* Niches & Languages Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-xs font-medium text-slate-400 block">Primary Niche</span>
            <span className="text-indigo-300 font-semibold mt-0.5 block">
              {creator.primaryNiche}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Secondary Niches</span>
            <span className="text-slate-200 font-semibold mt-0.5 block">
              {creator.secondaryNiches.join(', ') || 'None'}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Languages</span>
            <span className="text-slate-200 font-semibold mt-0.5 block">
              {creator.languages.join(' · ')}
            </span>
          </div>
        </div>
      </div>

      {/* Audience & Performance Stored Metrics */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">
            Audience &amp; Performance Metrics
          </h2>
          <span className="text-xs text-amber-400/90 font-mono">
            Fictional Demo Metrics (Seed Data)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono tabular-nums">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-xs font-medium text-slate-400 font-sans block">
              {isUgc ? 'Followers (UGC Creator)' : 'Total Followers'}
            </span>
            <span className="text-2xl font-bold text-white block">
              {creator.followers > 0 ? creator.followers.toLocaleString() : 'N/A (UGC)'}
            </span>
            <span className="text-xs text-slate-400 font-sans block">
              {isUgc
                ? 'Follower count is secondary for UGC'
                : 'Verified audience reach'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-xs font-medium text-slate-400 font-sans block">Average Views</span>
            <span className="text-2xl font-bold text-white block">
              {creator.averageViews.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-sans block">
              Baseline per-post view velocity
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-xs font-medium text-slate-400 font-sans block">Engagement Rate</span>
            <span className="text-2xl font-bold text-indigo-400 block">
              {creator.engagementRate}%
            </span>
            <span className="text-xs text-slate-400 font-sans block">
              Calculated on active community interactions
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-xs font-medium text-slate-400 font-sans block">Top Audience Hubs</span>
            <span className="text-base font-bold font-sans text-white block">
              {creator.audienceSummary.topCities.join(', ')}
            </span>
            <span className="text-xs text-slate-400 font-sans block">
              Ages {creator.audienceSummary.ageRange} · {creator.audienceSummary.genderSplit}
            </span>
          </div>
        </div>
      </div>

      {/* Services & Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Services Available */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Creator Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {creator.services.map((srv) => (
              <div
                key={srv}
                className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-200 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-medium">{srv}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-sm">
            <span className="font-semibold text-slate-200 block">
              Signature Creative Styles:
            </span>
            <div className="flex flex-wrap gap-2 text-slate-300">
              {creator.contentStyle.map((style) => (
                <span
                  key={style}
                  className="px-3 py-1 rounded-md bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Packages Available */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white">
              Standard Packages ({packages.length})
            </h2>
            <span className="text-xs text-slate-400">Fixed-scope deliverables</span>
          </div>

          {packages.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">
              Custom proposal rates start from PKR {creator.startingRatePKR.toLocaleString()}.
            </p>
          ) : (
            <div className="space-y-3.5">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {pkg.title}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Platform: {pkg.platform} · {pkg.deliveryDays} Days Delivery ·{' '}
                        {pkg.revisionsIncluded} Revisions
                      </div>
                    </div>
                    <div className="font-mono tabular-nums font-bold text-emerald-400 text-base shrink-0">
                      {pkg.currency} {pkg.pricePKR.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {pkg.description}
                  </p>
                  <div className="text-xs text-slate-400 pt-1">
                    Deliverables: {pkg.deliverables.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio & Highlights */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-4">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
          Portfolio &amp; Production Track Record
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creator.portfolioHighlights.map((highlight, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5 text-sm"
            >
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Video className="w-4 h-4 text-indigo-400" />
                <span>Featured Asset #{idx + 1}</span>
              </div>
              <p className="text-white font-semibold text-base">{highlight}</p>
              <p className="text-slate-400 text-xs">
                Category: {creator.primaryNiche} · Verified Demo Record
              </p>
            </div>
          ))}
        </div>

        {/* Previous Campaign Categories */}
        <div className="pt-3 border-t border-slate-800 text-sm">
          <span className="font-semibold text-slate-200 block mb-1">
            Previous Relevant Campaign Categories
          </span>
          <span className="text-slate-400 text-sm">
            {creator.previousCampaignCategories?.length > 0
              ? creator.previousCampaignCategories.join(' · ')
              : `${creator.primaryNiche} Products and E-commerce Campaigns`}
          </span>
        </div>
      </div>
    </div>
  );
}
