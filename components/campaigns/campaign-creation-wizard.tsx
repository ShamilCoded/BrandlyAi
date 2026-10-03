'use client';

/**
 * MODULE 5 — GUIDED MULTI-STEP CAMPAIGN CREATION WIZARD
 * Steps:
 * 1. Basics (Campaign Name, Category, Product/Service, Objective, Description)
 * 2. Budget (Amount, Currency default PKR)
 * 3. Audience (Age range, Gender when relevant, Target cities, Interests)
 * 4. Platforms (Instagram, TikTok, YouTube)
 * 5. Creator Requirements (Creator types, Preferred niche, Min followers [NOT forced for UGC creators], Languages, Location, Services)
 * 6. Deliverables (Reel, TikTok video, YouTube integration, Story, Product review, UGC video, Product photography)
 * 7. Duration (Start date, End date, Deadline)
 * Final Review: Clean summary, saves to Firestore, Primary CTA: "Find AI-Matched Creators"
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  BUSINESS_CATEGORIES,
  CAMPAIGN_OBJECTIVES,
  CREATOR_SERVICES,
  CREATOR_TYPES,
  CURRENCY_CODES,
  DELIVERABLE_TYPES,
  NICHE_CATEGORIES,
  PAKISTANI_CITIES,
  SOCIAL_PLATFORMS,
  SUPPORTED_LANGUAGES,
} from '@/lib/config/constants';
import { useAppState } from '@/lib/context/app-state-context';
import { DEMO_BUSINESSES } from '@/lib/seed/demo-dataset';
import type {
  Business,
  Campaign,
  CreatorServiceType,
  CreatorType,
  CurrencyCode,
  DeliverableType,
  NicheCategory,
  PakistaniCity,
  SocialPlatform,
  SupportedLanguage,
} from '@/lib/types/domain';

interface CampaignCreationWizardProps {
  activeBusiness?: Business | null;
  initialCampaign?: Campaign | null;
  onSaveComplete: (savedCampaign: Campaign, navigateToRecommendations: boolean) => Promise<void> | void;
  onCancel: () => void;
}

const STEPS = [
  { number: 1, title: 'Basics' },
  { number: 2, title: 'Budget' },
  { number: 3, title: 'Audience' },
  { number: 4, title: 'Platforms' },
  { number: 5, title: 'Creator Fit' },
  { number: 6, title: 'Deliverables' },
  { number: 7, title: 'Duration' },
  { number: 8, title: 'Final Review' },
] as const;

export function CampaignCreationWizard({
  activeBusiness,
  initialCampaign,
  onSaveComplete,
  onCancel,
}: CampaignCreationWizardProps) {
  const { businesses, activeBusiness: contextActiveBusiness, setActiveBusinessId } = useAppState();
  const availableBusinesses = businesses && businesses.length > 0 ? businesses : DEMO_BUSINESSES;
  
  const initialResolvedBusiness =
    availableBusinesses.find((b) => b.id === initialCampaign?.businessId) ||
    availableBusinesses.find((b) => b.id === activeBusiness?.id) ||
    availableBusinesses.find((b) => b.id === contextActiveBusiness?.id) ||
    availableBusinesses[0];

  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(
    initialResolvedBusiness?.id || 'biz-spacewise-pk'
  );

  const selectedBusiness =
    availableBusinesses.find((b) => b.id === selectedBusinessId) || initialResolvedBusiness || availableBusinesses[0];

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Step 1 — Basics
  const [title, setTitle] = useState<string>(initialCampaign?.title || '');
  const [category, setCategory] = useState<string>(
    initialCampaign?.category || selectedBusiness?.category || BUSINESS_CATEGORIES[0]
  );
  const [productOrService, setProductOrService] = useState<string>(
    initialCampaign?.productOrService || selectedBusiness?.flagshipProducts?.[0] || ''
  );
  const [objective, setObjective] = useState<string>(
    initialCampaign?.objective || CAMPAIGN_OBJECTIVES[0]
  );
  const [description, setDescription] = useState<string>(
    initialCampaign?.description || ''
  );

  // Step 2 — Budget (Default: PKR)
  const [budget, setBudget] = useState<number>(
    initialCampaign?.budget || selectedBusiness?.typicalBudgetPKR || 250000
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    initialCampaign?.currency || 'PKR'
  );

  // Step 3 — Audience
  const [audienceAgeRange, setAudienceAgeRange] = useState<string>(
    initialCampaign?.audienceAgeRange || '20–35'
  );
  const [audienceGender, setAudienceGender] = useState<string>(
    initialCampaign?.audienceGender || 'All / Not Gender-Specific'
  );
  const [targetLocations, setTargetLocations] = useState<PakistaniCity[]>(
    initialCampaign?.targetLocations ||
      (selectedBusiness?.targetMarkets && selectedBusiness.targetMarkets.length > 0
        ? selectedBusiness.targetMarkets
        : ['Karachi', 'Lahore', 'Islamabad'])
  );
  const [audienceInterestsInput, setAudienceInterestsInput] = useState<string>(
    initialCampaign?.audienceInterests?.join(', ') ||
      'Desk Setups, Consumer Tech, Remote Work'
  );

  // Step 4 — Platforms
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(
    initialCampaign?.platforms ||
      (selectedBusiness?.preferredPlatforms && selectedBusiness.preferredPlatforms.length > 0
        ? selectedBusiness.preferredPlatforms
        : ['Instagram', 'TikTok'])
  );

  // Step 5 — Creator Requirements
  const [creatorTypes, setCreatorTypes] = useState<CreatorType[]>(
    initialCampaign?.creatorTypes || ['Influencer', 'UGC Creator']
  );
  const [preferredNiches, setPreferredNiches] = useState<NicheCategory[]>(
    initialCampaign?.preferredNiches || (selectedBusiness?.industry ? [selectedBusiness.industry] : ['Technology'])
  );
  const [minimumFollowers, setMinimumFollowers] = useState<number>(
    initialCampaign?.minimumFollowers ?? 0
  );
  const [languages, setLanguages] = useState<SupportedLanguage[]>(
    initialCampaign?.languages || ['English', 'Urdu']
  );
  const [creatorLocations, setCreatorLocations] = useState<PakistaniCity[]>(
    initialCampaign?.creatorLocations || ['Karachi', 'Lahore', 'Islamabad']
  );
  const [requiredServices, setRequiredServices] = useState<CreatorServiceType[]>(
    initialCampaign?.requiredServices || [
      'Instagram Reel',
      'TikTok Video',
      'Product Review',
      'UGC Video',
    ]
  );

  const handleBusinessChange = (bizId: string) => {
    setSelectedBusinessId(bizId);
    setActiveBusinessId(bizId);
    const target = availableBusinesses.find((b) => b.id === bizId);
    if (target && !initialCampaign) {
      if (target.category) setCategory(target.category);
      if (target.flagshipProducts && target.flagshipProducts.length > 0) {
        setProductOrService(target.flagshipProducts[0]);
      }
      if (target.typicalBudgetPKR) setBudget(target.typicalBudgetPKR);
      if (target.targetMarkets && target.targetMarkets.length > 0) {
        setTargetLocations(target.targetMarkets);
      }
      if (target.industry) {
        setPreferredNiches([target.industry]);
      }
      if (target.preferredPlatforms && target.preferredPlatforms.length > 0) {
        setPlatforms(target.preferredPlatforms);
      }
    }
  };

  // Step 6 — Deliverables
  const [deliverables, setDeliverables] = useState<DeliverableType[]>(
    initialCampaign?.deliverables || ['Reel', 'TikTok video', 'Product review', 'UGC video']
  );

  // Step 7 — Duration
  const [startDate, setStartDate] = useState<string>(
    initialCampaign?.startDate || '2026-10-12'
  );
  const [endDate, setEndDate] = useState<string>(
    initialCampaign?.endDate || '2026-11-15'
  );
  const [applicationDeadline, setApplicationDeadline] = useState<string>(
    initialCampaign?.applicationDeadline || '2026-10-09'
  );

  const isUgcIncluded = creatorTypes.includes('UGC Creator');

  function toggleArrayItem<T>(list: T[], item: T, setter: (next: T[]) => void) {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  }

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!title.trim()) return 'Please enter a Campaign Name.';
        if (!category.trim()) return 'Please select a Business Category.';
        if (!productOrService.trim()) return 'Please specify the Product or Service.';
        if (!objective.trim()) return 'Please select a Campaign Objective.';
        return null;
      case 2:
        if (!budget || Number(budget) <= 0)
          return 'Please enter a valid positive Campaign Budget.';
        if (!currency) return 'Please select a Currency.';
        return null;
      case 3:
        if (!audienceAgeRange.trim()) return 'Please specify the target Audience Age Range.';
        if (targetLocations.length === 0)
          return 'Please select at least one Target Location.';
        if (!audienceInterestsInput.trim())
          return 'Please enter at least one Audience Interest.';
        return null;
      case 4:
        if (platforms.length === 0)
          return 'Please select at least one platform (Instagram, TikTok, or YouTube).';
        return null;
      case 5:
        if (creatorTypes.length === 0)
          return 'Please select at least one Creator Type.';
        if (preferredNiches.length === 0)
          return 'Please select at least one Preferred Niche.';
        if (languages.length === 0)
          return 'Please select at least one content Language.';
        if (creatorLocations.length === 0)
          return 'Please select at least one Creator Location.';
        if (requiredServices.length === 0)
          return 'Please select at least one Creator Service.';
        return null;
      case 6:
        if (deliverables.length === 0)
          return 'Please select at least one campaign Deliverable.';
        return null;
      case 7:
        if (!startDate || !endDate || !applicationDeadline)
          return 'Please provide Start Date, End Date, and Application Deadline.';
        if (endDate < startDate)
          return 'End Date must be on or after the Start Date.';
        return null;
      default:
        return null;
    }
  };

  const handleNextStep = () => {
    const err = validateStep(currentStep);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setCurrentStep((prev) => Math.min(8, prev + 1));
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSave = async (navigateToRecommendations: boolean) => {
    for (let s = 1; s <= 7; s++) {
      const err = validateStep(s);
      if (err) {
        setValidationError(`Step ${s}: ${err}`);
        setCurrentStep(s);
        return;
      }
    }

    setIsSaving(true);
    setValidationError(null);
    try {
      const payload: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } = {
        id: initialCampaign?.id,
        businessId: selectedBusiness?.id || 'biz-spacewise-pk',
        businessName: selectedBusiness?.name || 'SpaceWise',
        title: title.trim(),
        category: category.trim(),
        productOrService: productOrService.trim(),
        objective: objective.trim(),
        description:
          description.trim() ||
          `${title.trim()} promoting ${productOrService.trim()} for ${selectedBusiness?.name || 'Brand'}.`,
        budget: Number(budget),
        currency,
        audienceAgeRange: audienceAgeRange.trim(),
        audienceGender,
        targetLocations,
        audienceInterests: audienceInterestsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        platforms,
        creatorTypes,
        preferredNiches,
        minimumFollowers: isUgcIncluded ? 0 : Number(minimumFollowers) || 0,
        languages,
        creatorLocations,
        requiredServices,
        deliverables,
        startDate,
        endDate,
        applicationDeadline,
        status: 'active',
        isDemo: true,
        demoLabel: 'Fictional Demo Campaign',
      };

      await onSaveComplete(payload as Campaign, navigateToRecommendations);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'Failed to save campaign.'
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6 lg:p-8 space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {selectedBusiness?.name || 'SpaceWise'} (Demo Business) · Guided Campaign Builder
          </p>
          <h2 className="text-2xl font-bold text-white mt-1">
            {initialCampaign ? `Edit Campaign: ${initialCampaign.title}` : 'Create New Campaign'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 bg-slate-800 rounded-lg self-start sm:self-auto whitespace-nowrap cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
        {STEPS.map((s) => {
          const isActive = currentStep === s.number;
          const isCompleted = currentStep > s.number;
          return (
            <button
              key={s.number}
              type="button"
              onClick={() => {
                if (s.number < currentStep) {
                  setValidationError(null);
                  setCurrentStep(s.number);
                }
              }}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                isActive
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : isCompleted
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold tabular-nums">
                <span>0{s.number}</span>
                {isCompleted && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="text-sm font-bold mt-1.5 truncate">{s.title}</div>
            </button>
          );
        })}
      </div>

      {validationError && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/40 text-sm text-red-200 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Step 1 — Basics */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Business / Brand Account *
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => handleBusinessChange(e.target.value)}
                aria-label="Select Business for Campaign"
                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-base text-white bg-slate-950 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                {availableBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.category}) — {b.headquarters}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1.5">
                Campaign will be created and managed under this business profile with tailored creator recommendations.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., SpaceWise ErgoDock Pro Q4 Launch"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white focus:border-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Business Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-base text-white bg-slate-950 focus:border-indigo-500 focus:outline-none"
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Product / Service *
              </label>
              <input
                type="text"
                value={productOrService}
                onChange={(e) => setProductOrService(e.target.value)}
                placeholder="e.g., ErgoDock Pro 10-in-1 USB-C Hub"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white focus:border-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Campaign Objective *
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-base text-white bg-slate-950 focus:border-indigo-500 focus:outline-none"
              >
                {CAMPAIGN_OBJECTIVES.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Campaign Description / Talking Points
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe key product benefits and what creators should showcase..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white focus:border-indigo-500 focus:outline-none placeholder-slate-500"
            />
          </div>
        </div>
      )}

      {/* Step 2 — Budget */}
      {currentStep === 2 && (
        <div className="space-y-6 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Total Campaign Budget *
              </label>
              <input
                type="number"
                min={1000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg font-mono tabular-nums text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Currency *
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-base font-mono text-white bg-slate-950 focus:border-indigo-500 focus:outline-none"
              >
                {CURRENCY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code} {code === 'PKR' ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Default currency is PKR. Creator packages range from PKR 15,000 for UGC video clips to PKR 60,000+ for multi-platform integrations.
          </p>
        </div>
      )}

      {/* Step 3 — Audience */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Target Age Range *
              </label>
              <input
                type="text"
                value={audienceAgeRange}
                onChange={(e) => setAudienceAgeRange(e.target.value)}
                placeholder="e.g., 20–35"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white focus:border-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Gender Relevance (Only when relevant)
              </label>
              <select
                value={audienceGender}
                onChange={(e) => setAudienceGender(e.target.value)}
                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-base text-white bg-slate-950 focus:border-indigo-500 focus:outline-none"
              >
                <option value="All / Not Gender-Specific">
                  All / Not Gender-Specific
                </option>
                <option value="Primarily Female Audience">
                  Primarily Female Audience
                </option>
                <option value="Primarily Male Audience">
                  Primarily Male Audience
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2.5">
              Target Locations *
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PAKISTANI_CITIES.map((city) => {
                const selected = targetLocations.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(targetLocations, city, setTargetLocations)
                    }
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Audience Interests (comma-separated) *
            </label>
            <input
              type="text"
              value={audienceInterestsInput}
              onChange={(e) => setAudienceInterestsInput(e.target.value)}
              placeholder="e.g., Desk Setups, Productivity, Tech Hardware"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white focus:border-indigo-500 focus:outline-none placeholder-slate-500"
            />
          </div>
        </div>
      )}

      {/* Step 4 — Platforms */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-200">
            Select Platforms *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SOCIAL_PLATFORMS.map((platform) => {
              const selected = platforms.includes(platform);
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => toggleArrayItem(platforms, platform, setPlatforms)}
                  className={`p-5 rounded-2xl border text-left transition-colors cursor-pointer ${
                    selected
                      ? 'border-indigo-500 bg-indigo-600/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="text-lg font-bold">{platform}</div>
                  <p
                    className={`text-sm mt-1.5 leading-relaxed ${
                      selected ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {platform === 'Instagram' && 'Reels, Carousel Posts, Stories'}
                    {platform === 'TikTok' && 'Vertical Videos, Unboxing Hooks'}
                    {platform === 'YouTube' && 'Dedicated Reviews, Integrations, Shorts'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5 — Creator Requirements */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2.5">
              Creator Types * (Influencers &amp; UGC Creators treated distinctly)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {CREATOR_TYPES.map((ct) => {
                const selected = creatorTypes.includes(ct);
                return (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => toggleArrayItem(creatorTypes, ct, setCreatorTypes)}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-indigo-500 bg-indigo-600/20 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="text-base font-bold">{ct}</div>
                    <div
                      className={`text-sm mt-1.5 leading-snug ${
                        selected ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {ct === 'UGC Creator'
                        ? 'Evaluated on video production, not followers'
                        : ct === 'Influencer'
                        ? 'Broad reach + niche credibility'
                        : ct === 'Micro Influencer'
                        ? 'High engagement community'
                        : 'Long-form editorial storytelling'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="text-sm font-semibold text-slate-200">
                Minimum Followers (Optional — Bypassed automatically for UGC Creators)
              </label>
              {isUgcIncluded && (
                <span className="text-sm font-medium text-emerald-400">
                  UGC Creator selected: Follower floor bypassed (0)
                </span>
              )}
            </div>
            <input
              type="number"
              min={0}
              step={1000}
              disabled={isUgcIncluded}
              value={isUgcIncluded ? 0 : minimumFollowers}
              onChange={(e) => setMinimumFollowers(Number(e.target.value))}
              className="w-full sm:w-64 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-base font-mono tabular-nums text-white disabled:bg-slate-900 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2.5">
              Preferred Niches *
            </label>
            <div className="flex flex-wrap gap-2.5">
              {NICHE_CATEGORIES.map((niche) => {
                const selected = preferredNiches.includes(niche);
                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(preferredNiches, niche, setPreferredNiches)
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {niche}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">
                Languages *
              </label>
              <div className="flex flex-wrap gap-2.5">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const selected = languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleArrayItem(languages, lang, setLanguages)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">
                Creator Locations *
              </label>
              <div className="flex flex-wrap gap-2.5">
                {PAKISTANI_CITIES.map((city) => {
                  const selected = creatorLocations.includes(city);
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() =>
                        toggleArrayItem(creatorLocations, city, setCreatorLocations)
                      }
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2.5">
              Services Required *
            </label>
            <div className="flex flex-wrap gap-2.5">
              {CREATOR_SERVICES.map((srv) => {
                const selected = requiredServices.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(requiredServices, srv, setRequiredServices)
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {srv}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 6 — Deliverables */}
      {currentStep === 6 && (
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-200">
            Campaign Deliverables *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {DELIVERABLE_TYPES.map((deliv) => {
              const selected = deliverables.includes(deliv);
              return (
                <button
                  key={deliv}
                  type="button"
                  onClick={() => toggleArrayItem(deliverables, deliv, setDeliverables)}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    selected
                      ? 'border-indigo-500 bg-indigo-600/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="text-base font-bold">{deliv}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 7 — Duration */}
      {currentStep === 7 && (
        <div className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Application Deadline *
              </label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Campaign Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Campaign End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 8 — Final Review */}
      {currentStep === 8 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-5">
              <div>
                <p className="text-sm text-slate-400 font-medium">
                  Campaign Review · {selectedBusiness?.name || 'Brand'} (Demo Business)
                </p>
                <h3 className="text-xl font-bold text-white mt-1">
                  {title}
                </h3>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Budget</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">
                  {currency} {Number(budget).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category &amp; Product</div>
                <div className="font-bold text-white text-base">{category}</div>
                <div className="text-slate-300">{productOrService}</div>
                <div className="text-slate-400">Objective: {objective}</div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audience &amp; Platforms</div>
                <div className="font-bold text-white text-base">{platforms.join(' · ')}</div>
                <div className="text-slate-300">
                  {audienceAgeRange} · {audienceGender}
                </div>
                <div className="text-slate-400">{targetLocations.join(', ')}</div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Creator Requirements</div>
                <div className="font-bold text-white text-base">{creatorTypes.join(' · ')}</div>
                <div className="text-slate-300">Niches: {preferredNiches.join(', ')}</div>
                <div className="text-slate-400 font-mono tabular-nums">
                  {startDate} to {endDate}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-5 py-3 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Save Campaign
            </button>

            {/* Primary CTA (Module 5 Required: "Find AI-Matched Creators") */}
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-7 py-3.5 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Find AI-Matched Creators'}
            </button>
          </div>
        </div>
      )}

      {/* Wizard Footer Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-5">
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 bg-slate-800 rounded-xl flex items-center gap-2 disabled:opacity-40 whitespace-nowrap cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-sm font-semibold text-slate-300 font-mono tabular-nums">
          Step {currentStep} of {STEPS.length}
        </div>

        {currentStep < 8 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-sm text-emerald-400 font-bold">Ready</span>
        )}
      </div>
    </div>
  );
}
