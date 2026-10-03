'use client';

/**
 * MODULE 16 — DEMO MODE FOR HACKATHON & JUDGE TOUR
 * Provides:
 * - 5 Presets:
 *   1. SpaceWise Technology Product Campaign (Primary scenario)
 *   2. Restaurant Campaign (Koyla & Crust)
 *   3. Fashion Campaign (ZarbeModa)
 *   4. Beauty Campaign (Noor Botanics)
 *   5. UGC Product Campaign (Direct Response Video)
 * - 8-Step Interactive Judge Walkthrough
 * - 1-Click Role Switcher between Brand (SpaceWise) and Creator (Shamil)
 * - "Reset Demo Data" button to restore clean state
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Building,
  User,
  X,
  Send,
  Scale,
  Megaphone,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAppState } from '@/lib/context/app-state-context';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const DEMO_SCENARIOS = [
  {
    id: 'spacewise',
    title: '1. SpaceWise Tech Campaign (Primary)',
    businessId: 'biz-spacewise-pk',
    campaignId: 'camp-spacewise-ergodock',
    category: 'Technology / E-commerce',
    budget: 'PKR 250,000',
    description:
      'ErgoDock Pro hardware launch targeting remote professionals across Pakistan via bilingual desk tours. Matches Shamil as top creator.',
  },
  {
    id: 'restaurant',
    title: '2. Koyla & Crust Restaurant Campaign',
    businessId: 'biz-koyla-crust',
    campaignId: 'camp-koyla-chefs-table',
    category: 'Restaurant & Hospitality',
    budget: 'PKR 180,000',
    description:
      'Wood-fired smoked brisket weekend tasting menu foot-traffic drive in Lahore & Islamabad.',
  },
  {
    id: 'fashion',
    title: '3. ZarbeModa Fashion Campaign',
    businessId: 'biz-zarbemoda',
    campaignId: 'camp-zarbemoda-summer',
    category: 'Fashion & Apparel',
    budget: 'PKR 320,000',
    description:
      'Autumn-transition handloom and breathable linen overshirt edit in Karachi, Lahore, and Islamabad.',
  },
  {
    id: 'beauty',
    title: '4. Noor Botanics Beauty Campaign',
    businessId: 'biz-noor-botanics',
    campaignId: 'camp-noor-niacinamide',
    category: 'Beauty & Skincare',
    budget: 'PKR 210,000',
    description:
      'Barrier-repair 10% Niacinamide + Weightless SPF 50 Gel texture swatches and sunlit B-roll.',
  },
  {
    id: 'ugc',
    title: '5. Direct-Response UGC Drive',
    businessId: 'biz-spacewise-pk',
    campaignId: 'camp-spacewise-ergodock',
    category: 'UGC Product Ads',
    budget: 'PKR 50,000',
    description:
      'UGC video production with macro camera hooks. Prioritizes video craft and turnaround over follower count.',
  },
];

export function DemoTourModal({
  isOpen,
  onClose,
  onNavigateToTab,
}: DemoTourModalProps) {
  const {
    activeBusiness,
    setActiveBusinessId,
    activeCreator,
    setActiveCreatorId,
    userRole,
    setUserRole,
    refreshMarketplace,
  } = useAppState();

  const [activeStep, setActiveStep] = useState(1);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleSelectScenario = (scenario: typeof DEMO_SCENARIOS[0]) => {
    setActiveBusinessId(scenario.businessId);
    setUserRole('business');
    if (onNavigateToTab) onNavigateToTab('campaigns');
    onClose();
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await refreshMarketplace(true);
      setActiveBusinessId('biz-spacewise-pk');
      setActiveCreatorId('creator-shamil-karachi');
      setUserRole('business');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Compass className="w-4 h-4" />
              <span>Judge & Evaluator Guide • Brandly.ai</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-['Syne',sans-serif]">
              Interactive Marketplace Tour
            </h2>
            <p className="text-sm text-slate-300 font-medium">
              Test end-to-end two-sided matching without registration.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Role Switcher */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Current Perspective
            </span>
            <span className="text-sm text-indigo-300 font-semibold">
              {userRole === 'business'
                ? `Brand: ${activeBusiness?.name} (${activeBusiness?.category})`
                : `Creator: ${activeCreator?.name} (${activeCreator?.creatorType})`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserRole('business')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                userRole === 'business'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Brand View</span>
            </button>

            <button
              type="button"
              onClick={() => setUserRole('creator')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                userRole === 'creator'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Creator View (Shamil)</span>
            </button>
          </div>
        </div>

        {/* 8-Step Walkthrough */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Primary 2–3 Minute Demo Flow
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                step: 1,
                title: 'SpaceWise Campaign',
                desc: 'Review brand requirements, budget, deliverables, and targets.',
              },
              {
                step: 2,
                title: 'AI Analysis',
                desc: 'Campaign Agent normalizes brief into structured criteria.',
              },
              {
                step: 3,
                title: 'AI Recommendations',
                desc: 'Observe Shamil ranked #1 match with multi-signal score of 94.',
              },
              {
                step: 4,
                title: 'Why this Creator?',
                desc: 'Review factual grounded bullets without fabricated metrics.',
              },
              {
                step: 5,
                title: 'Creator Comparison',
                desc: 'Compare Shamil with UGC & tech creators side-by-side.',
              },
              {
                step: 6,
                title: 'Send Proposal',
                desc: 'Submit collaboration offer with budget and timeline in PKR.',
              },
              {
                step: 7,
                title: 'Creator Inbox',
                desc: 'Switch to Creator View to see live pending proposal in Shamil inbox.',
              },
              {
                step: 8,
                title: 'Accept / Negotiate',
                desc: 'Accept or submit counter-proposal and watch status sync instantly.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <span>Step {s.step}:</span>
                  <span className="text-white">{s.title}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Demo Scenarios Selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Pre-Seeded Demo Scenarios
          </h3>
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {DEMO_SCENARIOS.map((scen) => (
              <div
                key={scen.id}
                onClick={() => handleSelectScenario(scen)}
                className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-white">{scen.title}</h4>
                    <span className="text-xs text-emerald-400 font-semibold font-mono">
                      {scen.budget}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{scen.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDemo}
            disabled={isResetting}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting Data...' : 'Reset Demo Data'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveBusinessId('biz-spacewise-pk');
              setUserRole('business');
              if (onNavigateToTab) onNavigateToTab('campaigns');
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <span>Start Primary Demo (SpaceWise)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
