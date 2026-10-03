'use client';

import React, { useState } from 'react';
import { X, Building, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useAppState } from '@/lib/context/app-state-context';
import {
  BUSINESS_CATEGORIES,
  NICHE_CATEGORIES,
  PAKISTANI_CITIES,
  SOCIAL_PLATFORMS,
} from '@/lib/config/constants';
import type {
  NicheCategory,
  PakistaniCity,
  SocialPlatform,
} from '@/lib/types/domain';

interface RegisterBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (businessId: string) => void;
}

export function RegisterBusinessModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterBusinessModalProps) {
  const { registerBusiness } = useAppState();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(BUSINESS_CATEGORIES[0]);
  const [industry, setIndustry] = useState<NicheCategory>('Technology');
  const [headquarters, setHeadquarters] = useState<PakistaniCity>('Karachi');
  const [targetMarkets, setTargetMarkets] = useState<PakistaniCity[]>([
    'Karachi',
    'Lahore',
    'Islamabad',
  ]);
  const [website, setWebsite] = useState('');
  const [flagshipProductsInput, setFlagshipProductsInput] = useState('');
  const [preferredPlatforms, setPreferredPlatforms] = useState<SocialPlatform[]>([
    'Instagram',
    'TikTok',
  ]);
  const [typicalBudgetPKR, setTypicalBudgetPKR] = useState<number>(250000);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactRole, setContactRole] = useState('Brand & Marketing Lead');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTargetMarket = (city: PakistaniCity) => {
    setTargetMarkets((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const togglePlatform = (p: SocialPlatform) => {
    setPreferredPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your business or brand name.');
      return;
    }

    if (targetMarkets.length === 0) {
      setErrorMessage('Please select at least one target market city.');
      return;
    }

    if (preferredPlatforms.length === 0) {
      setErrorMessage('Please select at least one preferred social platform.');
      return;
    }

    const products = flagshipProductsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const created = await registerBusiness(
        {
          name: name.trim(),
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category,
          industry,
          headquarters,
          targetMarkets,
          website: website.trim() || `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.pk`,
          flagshipProducts: products.length > 0 ? products : [name.trim()],
          preferredPlatforms,
          typicalBudgetPKR: Number(typicalBudgetPKR) || 150000,
          contactPerson: contactPerson.trim() || 'Brand Representative',
          contactRole: contactRole.trim() || 'Marketing Lead',
          description:
            description.trim() ||
            `${name.trim()} is an emerging Pakistani ${category} brand focusing on authentic creator collaborations.`,
        },
        contactEmail.trim() || undefined
      );

      onSuccess?.(created.id);
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to register business. Please try again.'
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
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <Building className="w-3.5 h-3.5" />
              <span>Business Onboarding</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Syne',sans-serif]">
              Register Your Business
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Set up your brand profile to launch campaigns and receive AI-matched creator recommendations.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brand / Company Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chai Junction"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Business Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Industry Vertical *
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as NicheCategory)}
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
                Headquarters City *
              </label>
              <select
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value as PakistaniCity)}
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

          {/* Target Markets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Markets in Pakistan *
            </label>
            <div className="flex flex-wrap gap-2">
              {PAKISTANI_CITIES.map((city) => {
                const isSelected = targetMarkets.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleTargetMarket(city)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Website / Online Store
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbrand.pk"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Typical Campaign Budget (PKR) *
              </label>
              <input
                type="number"
                value={typicalBudgetPKR}
                onChange={(e) => setTypicalBudgetPKR(Number(e.target.value))}
                min={20000}
                step={10000}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Flagship Products */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Flagship Products or Services
            </label>
            <input
              type="text"
              value={flagshipProductsInput}
              onChange={(e) => setFlagshipProductsInput(e.target.value)}
              placeholder="e.g., Karak Chai, Bun Muska, Artisanal Cold Brew (comma separated)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Preferred Platforms */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Preferred Social Platforms *
            </label>
            <div className="flex gap-2.5">
              {SOCIAL_PLATFORMS.map((platform) => {
                const active = preferredPlatforms.includes(platform);
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

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Brand Overview &amp; Collaboration Goals
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell creators about your brand story, product quality, and the kind of content you want to produce..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Account Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="brand@yourbrand.pk"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contact Person Name
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g., Tariq Mahmood"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Designation / Role
              </label>
              <input
                type="text"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="e.g., Head of Growth"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
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
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Business'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
