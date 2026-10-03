'use client';

/**
 * MODULE 1 — BRAND SYSTEM & LANDING PAGE
 * Brand: Brandly.ai
 * Tagline: "Find the right creator. Build the right campaign."
 *
 * Core sections:
 * - Hero: Headline, value prop, Primary CTA "Try Demo", Secondary CTAs "I'm a Business", "I'm a Creator"
 * - Live Hero Interactive Marketplace Preview (SpaceWise + Shamil #1 Match)
 * - How It Works: 4-step progressive flow
 * - For Businesses: Features & benefits
 * - For Creators: Profiles, packages, proposals, opportunities
 * - AI Matching: Transparent explanation of the 11 matching dimensions & fair UGC creator evaluation
 * - Full responsive layout utilizing modern wide screen proportions without blank side gutters
 */

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Target,
  Users,
  Layers,
  CheckCircle2,
  Cpu,
  BarChart3,
  Video,
  ShieldCheck,
  Building,
  Compass,
  Zap,
  Star,
  MapPin,
  Send,
  Scale,
  Shirt,
  Utensils,
  Dumbbell,
  Plane,
  Gamepad2,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { NICHE_CATEGORIES, PAKISTANI_CITIES } from '@/lib/config/constants';

interface LandingPageProps {
  onStartDemo: () => void;
  onExploreBusinesses: () => void;
  onExploreCreators: () => void;
}

export function LandingPage({
  onStartDemo,
  onExploreBusinesses,
  onExploreCreators,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white font-['Syne',sans-serif]">
              Brandly<span className="text-indigo-400">.ai</span>
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#for-businesses" className="hover:text-white transition-colors">
            For Businesses
          </a>
          <a href="#for-creators" className="hover:text-white transition-colors">
            For Creators
          </a>
          <a href="#ai-matching" className="hover:text-white transition-colors">
            AI Matching
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStartDemo}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2 cursor-pointer"
          >
            <span>Launch Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 lg:px-12 max-w-[1500px] mx-auto w-full">
        {/* Ambient subtle backdrop glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column: Conversion Copy & Action Hierarchy */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI-Powered Creator Marketplace</span>
            </div>

            {/* 1. Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-['Syne',sans-serif]">
              Find the right creator.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-300 block sm:inline">
                Build the right campaign.
              </span>
            </h1>

            {/* 2. Supporting Copy (Value Proposition) */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Brandly.ai uses AI to match businesses with relevant influencers and UGC creators based on campaign goals, audience, niche, platform, budget, and content requirements — not follower count alone.
            </p>

            {/* 3, 4, 5, 7. Visual Hierarchy: Try Live Demo -> Business / Creator paths -> Demo reassurance */}
            <div className="space-y-4 pt-2">
              {/* Primary CTA */}
              <div>
                <button
                  type="button"
                  onClick={onStartDemo}
                  className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <span>Try Live Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={onExploreBusinesses}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-all cursor-pointer text-center"
                >
                  I&apos;m a Business
                </button>
                <button
                  type="button"
                  onClick={onExploreCreators}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-all cursor-pointer text-center"
                >
                  I&apos;m a Creator
                </button>
              </div>

              {/* Demo Reassurance */}
              <p className="text-xs text-slate-400 font-medium pt-0.5">
                No registration required for the demo.
              </p>
            </div>
          </div>

          {/* Right Column: Hero Visual (AI Recommended Creator Card) */}
          <div className="lg:col-span-5 xl:col-span-5 w-full max-w-lg mx-auto lg:max-w-none">
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md relative overflow-hidden space-y-5">
              {/* Subtle top header bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Recommended Creator</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold font-mono">
                  <span>94% Campaign Fit</span>
                </div>
              </div>

              {/* Creator Profile Summary */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-md flex-shrink-0">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white font-bold text-xl">
                    S
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight truncate">Shamil</h3>
                    <span className="text-xs text-slate-400 font-mono">@shamil.tech</span>
                  </div>
                  <p className="text-sm font-semibold text-indigo-400 mt-0.5">Technology Creator</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Karachi · Instagram · TikTok</span>
                  </p>
                </div>
              </div>

              {/* Tags: Technology · Pakistan · Product Review */}
              <div className="flex flex-wrap gap-2 py-3 border-y border-slate-800/80">
                <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/70 text-xs font-medium text-slate-200">
                  Technology
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/70 text-xs font-medium text-slate-200">
                  Pakistan
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/70 text-xs font-medium text-slate-200">
                  Product Review
                </span>
              </div>

              {/* Grounded Demo Context */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Match Rationale
                </div>
                <p className="leading-relaxed">
                  Bilingual tech hardware reviews and desk tours aligned with audience preferences in Karachi.
                </p>
              </div>

              {/* Primary Action: View Creator */}
              <button
                type="button"
                onClick={onStartDemo}
                className="w-full py-3.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>View Creator</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Proof / Current Demo Environment Section */}
      <section className="border-y border-slate-800/80 bg-slate-900/30 py-7 px-4 sm:px-8 lg:px-12 w-full">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Demo Environment
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 lg:gap-14 w-full md:w-auto">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif] tracking-tight">
                40+
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                Demo Creators
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif] tracking-tight">
                10+
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                Campaign Matching Factors
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif] tracking-tight">
                4
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                Creator Types
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif] tracking-tight">
                10+
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                Industries
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Brandly? Differentiation Section */}
      <section id="why-brandly" className="py-20 border-t border-slate-800/60 bg-slate-950/60">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
              Why Brandly?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
              Not just follower count. Real campaign fit.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Brandly.ai evaluates creators against the actual campaign requirements, helping businesses consider audience, niche, platform, content capability, budget, and other relevant signals together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Campaign Fit */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl font-['Syne',sans-serif]">
                Campaign Fit
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Match creators to the actual goals, deliverables, audience, and requirements of the campaign.
              </p>
            </div>

            {/* Card 2: Audience Fit */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl font-['Syne',sans-serif]">
                Audience Fit
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Consider whether a creator&apos;s audience and location align with the campaign target.
              </p>
            </div>

            {/* Card 3: Content Fit */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl font-['Syne',sans-serif]">
                Content Fit
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Match creators based on content services, niche, style, and requested deliverables.
              </p>
            </div>

            {/* Card 4: Budget Fit */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl font-['Syne',sans-serif]">
                Budget Fit
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Surface creators and packages that are relevant to the campaign budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/60 bg-slate-900/40">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
              Seamless Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
              How Brandly.ai Works
            </h2>
            <p className="text-base text-slate-300">
              From campaign brief to relevant creator recommendations.
            </p>
          </div>

          {/* 5-Step Connected Workflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 relative">
            {[
              {
                step: '01',
                title: 'Describe Your Campaign',
                desc: 'Business provides campaign goals, audience, budget, platforms, creator preferences, and deliverables.',
                icon: Target,
                accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
              },
              {
                step: '02',
                title: 'AI Understands Your Requirements',
                desc: 'Campaign Agent interprets the campaign and creates a structured campaign specification.',
                icon: Cpu,
                accent: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
              },
              {
                step: '03',
                title: 'Find Relevant Creators',
                desc: 'Creator Intelligence Agent searches and filters creator profiles using deterministic campaign requirements.',
                icon: Users,
                accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
              },
              {
                step: '04',
                title: 'Evaluate Campaign Fit',
                desc: 'Matching Agent evaluates relevant creators against campaign-specific signals.',
                icon: Scale,
                accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              },
              {
                step: '05',
                title: 'Compare & Collaborate',
                desc: 'Business reviews recommendations, compares creators, and sends a proposal.',
                icon: Send,
                accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between relative group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono font-bold tracking-wider text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                        {item.step}
                      </div>
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.accent}`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {index < 4 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600 font-mono text-sm pointer-events-none">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Preview: AI Recommendation Experience */}
      <section id="product-preview" className="py-20 border-t border-slate-800/60 bg-slate-950/70">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Interface Preview</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
              See Brandly.ai in action
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              Turn a campaign brief into relevant creator recommendations.
            </p>
          </div>

          {/* Realistic SaaS Product Window Frame */}
          <div className="rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Window Chrome / Titlebar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-slate-400 hidden sm:inline">
                  brandly.ai/app/campaigns/spacewise-promo/recommendations
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
                  Demo Data
                </span>
                <button
                  type="button"
                  onClick={onStartDemo}
                  className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Launch Live Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dashboard Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
              {/* CAMPAIGN PANEL (Left: 4 cols) */}
              <div className="lg:col-span-4 p-6 sm:p-7 space-y-6 bg-slate-950/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Campaign Panel
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-medium text-slate-300">
                    Fictional Demo
                  </span>
                </div>

                <div className="space-y-1.5 pb-4 border-b border-slate-800/80">
                  <div className="text-xs font-semibold text-indigo-400">Brand Brief</div>
                  <h3 className="text-xl font-bold text-white tracking-tight">SpaceWise</h3>
                  <p className="text-sm font-medium text-slate-300">Product Promotion Campaign</p>
                </div>

                {/* Structured Campaign Specs */}
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Budget</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      PKR 50,000
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Target Platforms</span>
                    <span className="font-medium text-white">Instagram · TikTok</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Categories</span>
                    <span className="font-medium text-white">Technology · Lifestyle</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Target Market</span>
                    <span className="font-medium text-white">Pakistan</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Target Audience</span>
                    <span className="font-medium text-white">18–35</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  Campaign Agent normalized this brief across 11 parameters to query creator fit.
                </div>
              </div>

              {/* RECOMMENDATION PANEL (Right: 8 cols) */}
              <div className="lg:col-span-8 p-6 sm:p-7 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-lg font-bold text-white font-['Syne',sans-serif]">
                        AI Recommended Creators
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ranked based on campaign requirements, audience overlap, and content relevance.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 self-start sm:self-auto px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                    Demo Dataset
                  </span>
                </div>

                {/* Primary Creator Card: Shamil */}
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/40 shadow-lg space-y-5">
                  {/* Top Creator Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-md shrink-0">
                        <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-white font-bold text-lg">
                          S
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-white">Shamil</h4>
                          <span className="text-xs text-slate-400 font-mono">@shamil.tech</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          <span className="text-indigo-400 font-semibold">Technology</span> · Influencer · Karachi · Instagram · TikTok
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold font-mono">
                        94% Campaign Fit
                      </span>
                    </div>
                  </div>

                  {/* Creator Quantitative Metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-xs text-slate-400 font-medium">Followers</div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">35,000</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-xs text-slate-400 font-medium">Avg Views</div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">12,000</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-xs text-slate-400 font-medium">Engagement</div>
                      <div className="text-base font-bold text-indigo-400 font-mono mt-0.5">5.8%</div>
                    </div>
                  </div>

                  {/* WHY THIS CREATOR: Concise Grounded Bullets */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Why This Creator
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Technology niche alignment</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Required platforms available</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Relevant product-review service</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Location aligns with campaign target</span>
                      </li>
                    </ul>
                  </div>

                  {/* Actions: View Profile · Compare · Send Proposal */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={onStartDemo}
                      className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg cursor-pointer transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={onStartDemo}
                      className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg cursor-pointer transition-colors"
                    >
                      Compare
                    </button>
                    <button
                      type="button"
                      onClick={onStartDemo}
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Proposal</span>
                    </button>
                  </div>
                </div>

                {/* Secondary Creator Preview Item (Hamza Tariq) */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold shrink-0">
                      H
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Hamza Tariq</span>
                        <span className="text-slate-400">@hamzabuiltthis</span>
                      </div>
                      <span className="text-slate-400">Technology · Micro Influencer · Lahore · 19,500 followers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono font-semibold">
                      88% Match
                    </span>
                    <button
                      type="button"
                      onClick={onStartDemo}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business vs Creator: Two-Sided Marketplace Section */}
      <section id="for-businesses" className="py-20 border-t border-slate-800/60 bg-slate-900/30">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
              Two-Sided Marketplace
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
              One platform. Two sides of the marketplace.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* LEFT: FOR BUSINESSES */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-bold tracking-wider uppercase">
                  <Building className="w-3.5 h-3.5" />
                  <span>FOR BUSINESSES</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Syne',sans-serif] leading-snug">
                  Find creators that fit your campaign.
                </h3>

                {/* Workflow Sequence */}
                <div className="space-y-3 pt-2">
                  {[
                    { step: '01', title: 'Create Campaign', icon: Target },
                    { step: '02', title: 'Discover Relevant Creators', icon: Compass },
                    { step: '03', title: 'Review Recommendations', icon: CheckCircle2 },
                    { step: '04', title: 'Compare Creators', icon: Scale },
                    { step: '05', title: 'Send Proposal', icon: Send },
                  ].map((item, idx) => {
                    const StepIcon = item.icon;
                    return (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {item.step}
                          </div>
                          {idx < 4 && <div className="w-0.5 h-4 bg-slate-800 my-1" />}
                        </div>
                        <div className="pt-1.5 flex items-center gap-2.5">
                          <StepIcon className="w-4 h-4 text-sky-400 shrink-0" />
                          <span className="text-sm font-bold text-white">{item.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onExploreBusinesses}
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Explore as a Business</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* RIGHT: FOR CREATORS */}
            <div id="for-creators" className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-bold tracking-wider uppercase">
                  <Users className="w-3.5 h-3.5" />
                  <span>FOR CREATORS</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Syne',sans-serif] leading-snug">
                  Turn your content skills into brand opportunities.
                </h3>

                {/* Workflow Sequence */}
                <div className="space-y-3 pt-2">
                  {[
                    { step: '01', title: 'Build Your Profile', icon: Users },
                    { step: '02', title: 'Show Your Services', icon: Video },
                    { step: '03', title: 'Discover Campaign Opportunities', icon: Compass },
                    { step: '04', title: 'Receive Proposals', icon: CheckCircle2 },
                    { step: '05', title: 'Collaborate with Brands', icon: Building },
                  ].map((item, idx) => {
                    const StepIcon = item.icon;
                    return (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {item.step}
                          </div>
                          {idx < 4 && <div className="w-0.5 h-4 bg-slate-800 my-1" />}
                        </div>
                        <div className="pt-1.5 flex items-center gap-2.5">
                          <StepIcon className="w-4 h-4 text-violet-400 shrink-0" />
                          <span className="text-sm font-bold text-white">{item.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onExploreCreators}
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-xl transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Explore as a Creator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Influencers + UGC Creators Positioning Section */}
      <section id="ugc-positioning" className="py-20 border-t border-slate-800/60 bg-slate-950/60">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
              Creator Archetypes
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
              Influencers + UGC Creators
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              Choose creators based on what your campaign actually needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Card 1: Influencers */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 font-mono">
                    Audience-Led
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Syne',sans-serif]">
                    Influencers
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-2.5">
                    Connect with creators who bring an existing audience, reach, and content presence across social platforms.
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Relevant Factors
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Audience', 'Reach', 'Niche', 'Platform', 'Engagement'].map((factor) => (
                      <span
                        key={factor}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Ideal for reach, community trust, and product awareness.</span>
              </div>
            </div>

            {/* Card 2: UGC Creators */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 font-mono">
                    Content-Led
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Syne',sans-serif]">
                    UGC Creators
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-2.5">
                    Work with creators who specialize in producing authentic brand content, even when audience size is not the primary campaign requirement.
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Relevant Factors
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Content Quality',
                      'Services',
                      'Content Style',
                      'Deliverables',
                      'Product Fit',
                      'Availability',
                    ].map((factor) => (
                      <span
                        key={factor}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Example Deliverables
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['UGC Video', 'Product Demo', 'Testimonial', 'Lifestyle Content'].map((ex) => (
                      <span
                        key={ex}
                        className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero follower floor — evaluated strictly on production craft.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creators Across Industries Section */}
      <section id="categories" className="py-20 border-t border-slate-800/60 bg-slate-900/30">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
              Marketplace Breadth
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
              Creators across industries
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              Find creators relevant to the products, services, and audiences you want to reach.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {[
              {
                name: 'Technology',
                desc: 'Apps, devices, SaaS, gadgets and tech products.',
                icon: Cpu,
                accent: 'text-indigo-400',
              },
              {
                name: 'Fashion',
                desc: 'Clothing, accessories, styling and fashion brands.',
                icon: Shirt,
                accent: 'text-violet-400',
              },
              {
                name: 'Beauty',
                desc: 'Skincare, cosmetics, haircare and personal care.',
                icon: Sparkles,
                accent: 'text-pink-400',
              },
              {
                name: 'Food',
                desc: 'Restaurants, food products, cafes and culinary brands.',
                icon: Utensils,
                accent: 'text-amber-400',
              },
              {
                name: 'Fitness',
                desc: 'Fitness, wellness, sports and active lifestyle.',
                icon: Dumbbell,
                accent: 'text-emerald-400',
              },
              {
                name: 'Travel',
                desc: 'Travel destinations, hotels, experiences and tourism.',
                icon: Plane,
                accent: 'text-sky-400',
              },
              {
                name: 'Gaming',
                desc: 'Games, gaming hardware, esports and entertainment.',
                icon: Gamepad2,
                accent: 'text-purple-400',
              },
              {
                name: 'Lifestyle',
                desc: 'Everyday products, home, culture and lifestyle brands.',
                icon: Compass,
                accent: 'text-teal-400',
              },
              {
                name: 'Education',
                desc: 'Courses, learning platforms and educational products.',
                icon: GraduationCap,
                accent: 'text-blue-400',
              },
              {
                name: 'Business',
                desc: 'B2B products, professional services and business brands.',
                icon: Briefcase,
                accent: 'text-slate-300',
              },
            ].map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div
                  key={cat.name}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 text-indigo-400 group-hover:text-indigo-300 flex items-center justify-center shrink-0 transition-colors">
                      <CatIcon className={`w-5 h-5 ${cat.accent}`} />
                    </div>
                    <h3 className="font-bold text-white text-base font-['Syne',sans-serif]">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Transparency Section */}
      <section id="ai-matching" className="py-20 border-t border-slate-800/60 bg-slate-900/50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
              AI Transparency
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
              AI that explains its recommendations
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Brandly.ai evaluates creators using multiple campaign-specific signals and provides a concise explanation for each recommendation.
            </p>
          </div>

          {/* Structured Signal Matrix */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
              Evaluated Matching Signals
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {[
                'Campaign Goal',
                'Niche Relevance',
                'Audience Fit',
                'Platform Fit',
                'Location',
                'Creator Type',
                'Services',
                'Deliverables',
                'Budget',
                'Engagement',
                'Average Views',
                'Language',
                'Availability',
              ].map((signal) => (
                <div
                  key={signal}
                  className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm font-medium text-slate-200 flex items-center gap-2 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Box & Trust Guarantees */}
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-sm text-slate-300 leading-relaxed text-center">
              Brandly.ai combines deterministic filtering with AI-powered semantic evaluation. Structured campaign requirements narrow the candidate pool, then the Matching Agent evaluates relevant creators against the campaign.
            </div>

            {/* Trust and Privacy Assurance Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p className="font-semibold text-white">
                  Recommendations are decision-support signals, not guarantees.
                </p>
                <p className="text-slate-400">
                  Brandly.ai only uses creator information available in the platform&apos;s creator profiles when generating recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Demo Call-to-Action Section */}
      <section className="py-24 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 relative overflow-hidden">
        {/* Subtle ambient backdrop glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Demo Ready</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-['Syne',sans-serif] leading-tight">
            Stop searching for creators manually.
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Let Brandly.ai identify campaign-relevant creators based on your campaign goals, audience, niche, platform, budget, and content needs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            {/* Primary CTA */}
            <button
              type="button"
              onClick={onStartDemo}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <span>Try the Live Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary CTA */}
            <button
              type="button"
              onClick={onExploreBusinesses}
              className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-all cursor-pointer text-center"
            >
              Explore as a Business
            </button>

            {/* Optional Creator CTA */}
            <button
              type="button"
              onClick={onExploreCreators}
              className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-all cursor-pointer text-center"
            >
              Explore as a Creator
            </button>
          </div>

          <p className="text-xs text-slate-400 font-medium pt-1">
            No registration required for the demo.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/80 text-sm text-slate-400">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base font-['Syne',sans-serif]">
              Brandly<span className="text-indigo-400">.ai</span>
            </span>
            <span>—</span>
            <span>Find the right creator. Build the right campaign.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Pakistani Creator Ecosystem</span>
            <span>•</span>
            <span>Fictional Demo Environment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
