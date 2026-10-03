'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, AlertCircle, Video, UserCheck } from 'lucide-react';
import { useAppState } from '@/lib/context/app-state-context';
import {
  CREATOR_SERVICES,
  CREATOR_TYPES,
  NICHE_CATEGORIES,
  PAKISTANI_CITIES,
  SOCIAL_PLATFORMS,
  SUPPORTED_LANGUAGES,
} from '@/lib/config/constants';
import type {
  CreatorServiceType,
  CreatorType,
  NicheCategory,
  PakistaniCity,
  SocialPlatform,
  SupportedLanguage,
} from '@/lib/types/domain';

interface RegisterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (creatorId: string) => void;
}

export function RegisterCreatorModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterCreatorModalProps) {
  const { registerCreator } = useAppState();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [creatorType, setCreatorType] = useState<CreatorType>('UGC Creator');
  const [location, setLocation] = useState<PakistaniCity>('Karachi');
  const [primaryNiche, setPrimaryNiche] = useState<NicheCategory>('Technology');
  const [secondaryNiches, setSecondaryNiches] = useState<NicheCategory[]>(['Lifestyle']);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['Instagram', 'TikTok']);
  const [languages, setLanguages] = useState<SupportedLanguage[]>(['Urdu', 'English']);
  const [services, setServices] = useState<CreatorServiceType[]>([
    'UGC Video',
    'Instagram Reel',
    'Product Review',
  ]);
  const [startingRatePKR, setStartingRatePKR] = useState<number>(20000);
  const [turnaroundDays, setTurnaroundDays] = useState<number>(3);
  const [contactEmail, setContactEmail] = useState('');
  const [followers, setFollowers] = useState<number>(3500);
  const [averageViews, setAverageViews] = useState<number>(6500);
  const [engagementRate, setEngagementRate] = useState<number>(6.5);
  const [bio, setBio] = useState('');
  const [contentStyleInput, setContentStyleInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUgc = creatorType === 'UGC Creator';

  const togglePlatform = (p: SocialPlatform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((i) => i !== p) : [...prev, p]
    );
  };

  const toggleLanguage = (lang: SupportedLanguage) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((i) => i !== lang) : [...prev, lang]
    );
  };

  const toggleService = (srv: CreatorServiceType) => {
    setServices((prev) =>
      prev.includes(srv) ? prev.filter((i) => i !== srv) : [...prev, srv]
    );
  };

  const toggleSecondaryNiche = (n: NicheCategory) => {
    setSecondaryNiches((prev) =>
      prev.includes(n) ? prev.filter((i) => i !== n) : [...prev, n]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full creator name.');
      return;
    }

    if (!handle.trim()) {
      setErrorMessage('Please enter your primary social handle (e.g. @name).');
      return;
    }

    if (platforms.length === 0) {
      setErrorMessage('Please select at least one active platform.');
      return;
    }

    if (languages.length === 0) {
      setErrorMessage('Please select at least one content language.');
      return;
    }

    if (services.length === 0) {
      setErrorMessage('Please select at least one deliverable service offered.');
      return;
    }

    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    const styles = contentStyleInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const created = await registerCreator({
        name: name.trim(),
        handle: cleanHandle,
        creatorType,
        location,
        followers: isUgc ? Number(followers) || 0 : Number(followers) || 1000,
        averageViews: Number(averageViews) || 3000,
        engagementRate: Number(engagementRate) || 5.0,
        primaryNiche,
        secondaryNiches,
        platforms,
        languages,
        services,
        bio:
          bio.trim() ||
          `${name.trim()} is an authentic Pakistani ${creatorType} specializing in ${primaryNiche} content across ${platforms.join(' & ')}.`,
        contentStyle:
          styles.length > 0
            ? styles
            : ['High-contrast lighting', 'Bilingual Urdu/English', 'Problem/solution hook'],
        startingRatePKR: Number(startingRatePKR) || 15000,
        availability: 'Available',
        turnaroundDays: Number(turnaroundDays) || 3,
        portfolioHighlights: ['Sample Deliverable Video', 'Brand Review Integration'],
        portfolioItems: [],
        previousCampaignCategories: [primaryNiche, ...secondaryNiches],
        audienceSummary: {
          topCities: [location, 'Lahore', 'Karachi'],
          ageRange: '18–32',
          genderSplit: '55% Female · 45% Male',
        },
      });

      onSuccess?.(created.id);
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to register creator profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-300">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Creator Marketplace Onboarding</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Syne',sans-serif]">
              Register as a Creator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Join Brandly.ai to receive campaign proposals, showcase your deliverables, and match with verified Pakistani businesses.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mx-6 sm:mx-7 mt-5 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs sm:text-sm text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {/* Creator Type with Guidance */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-200">
                Creator Type *
              </label>
              <span className="text-xs text-indigo-400 font-medium">
                {isUgc ? 'Production-first (Followers not required)' : 'Reach & Influence focus'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CREATOR_TYPES.map((t) => {
                const isSelected = creatorType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCreatorType(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              💡 <strong>UGC Creators</strong> are evaluated on production craft, macro clarity, and hooks regardless of audience size.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Zainab Malik"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Social Handle *
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@zainab.creates"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Content Niche *
              </label>
              <select
                value={primaryNiche}
                onChange={(e) => setPrimaryNiche(e.target.value as NicheCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {NICHE_CATEGORIES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                City / Location in Pakistan *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as PakistaniCity)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {PAKISTANI_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Niches */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Secondary Content Niches
            </label>
            <div className="flex flex-wrap gap-2">
              {NICHE_CATEGORIES.filter((n) => n !== primaryNiche).map((n) => {
                const selected = secondaryNiches.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleSecondaryNiche(n)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Active Platforms *
            </label>
            <div className="flex gap-2.5">
              {SOCIAL_PLATFORMS.map((platform) => {
                const active = platforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    <span>{platform}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Delivery Languages *
            </label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const selected = languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Services Offered */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deliverable Services Offered *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CREATOR_SERVICES.map((srv) => {
                const selected = services.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleService(srv)}
                    className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selected
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{srv}</span>
                    {selected && <Check className="w-3 h-3 text-indigo-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing & Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Starting Rate (PKR) *
              </label>
              <input
                type="number"
                value={startingRatePKR}
                onChange={(e) => setStartingRatePKR(Number(e.target.value))}
                min={5000}
                step={2500}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Turnaround (Days)
              </label>
              <input
                type="number"
                value={turnaroundDays}
                onChange={(e) => setTurnaroundDays(Number(e.target.value))}
                min={1}
                max={30}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Follower Count
              </label>
              <input
                type="number"
                value={followers}
                onChange={(e) => setFollowers(Number(e.target.value))}
                min={0}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bio / Pitch */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Creator Bio &amp; Pitch
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your camera gear, lighting aesthetic, content format, and past experience with brands..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Content Style Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Content Style &amp; Visual Hooks (comma-separated)
            </label>
            <input
              type="text"
              value={contentStyleInput}
              onChange={(e) => setContentStyleInput(e.target.value)}
              placeholder="e.g., Macro lens detail, Clean desk aesthetics, Fast problem-solution hooks"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-md shadow-violet-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register as Creator'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
