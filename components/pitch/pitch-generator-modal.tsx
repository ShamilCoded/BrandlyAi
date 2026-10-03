'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  RefreshCw,
  Send,
  Mail,
  MessageCircle,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Info,
  Edit3,
} from 'lucide-react';
import type { Campaign, Creator } from '@/lib/types/domain';
import {
  generateCreatorPitch,
  type PitchType,
  type PitchTone,
  type GeneratedPitchResult,
} from '@/lib/services/pitch-service';

interface PitchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator | null;
  campaign: Campaign | null;
  businessName?: string;
  onContinueToProposal: (
    creator: Creator,
    campaignId: string,
    message: string
  ) => void;
}

export function PitchGeneratorModal({
  isOpen,
  onClose,
  creator,
  campaign,
  businessName = 'SpaceWise',
  onContinueToProposal,
}: PitchGeneratorModalProps) {
  const [pitchType, setPitchType] = useState<PitchType>('instagram_dm');
  const [tone, setTone] = useState<PitchTone>('professional');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [subjectText, setSubjectText] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [personalizationPoints, setPersonalizationPoints] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  const handleGenerate = useCallback(
    async (typeToUse: PitchType = pitchType, toneToUse: PitchTone = tone) => {
      if (!creator || !campaign) return;

      setIsLoading(true);
      setError(null);
      setCopied(false);

      try {
        const result: GeneratedPitchResult = await generateCreatorPitch({
          campaign: {
            ...campaign,
            businessName,
          },
          creator,
          pitchType: typeToUse,
          tone: toneToUse,
        });

        setSubjectText(result.subject || '');
        setMessageText(result.message || '');
        setPersonalizationPoints(result.personalizationPoints || []);
        setIsAiGenerated(result.isAiGenerated);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to generate the pitch right now.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [creator, campaign, businessName, pitchType, tone]
  );

  // Auto-generate on modal open if creator and campaign exist
  useEffect(() => {
    if (isOpen && creator && campaign) {
      void handleGenerate(pitchType, tone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, creator?.id, campaign?.id]);

  if (!isOpen || !creator || !campaign) {
    return null;
  }

  const handleCopy = async () => {
    try {
      const fullTextToCopy =
        pitchType === 'email' && subjectText.trim()
          ? `Subject: ${subjectText}\n\n${messageText}`
          : messageText;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullTextToCopy);
      } else {
        // Fallback for older browsers
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = fullTextToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleContinue = () => {
    const finalMessage =
      pitchType === 'email' && subjectText.trim()
        ? `Subject: ${subjectText}\n\n${messageText}`
        : messageText;
    onContinueToProposal(creator, campaign.id, finalMessage);
    onClose();
  };

  const isDemo = Boolean(creator.isDemo || campaign.isDemo);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Syne',sans-serif]">
                Generate a Personalized Pitch
              </h2>
              <p className="text-xs text-slate-400">
                Tailored outreach crafted specifically from your campaign brief and creator profile.
              </p>
            </div>
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

        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Context Summary Box */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                Match Context
              </span>
              {isDemo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  Demo Campaign Data
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px]">Creator</span>
                <span className="font-semibold text-white truncate block">
                  {creator.name}{' '}
                  <span className="font-normal text-slate-400">({creator.handle})</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Creator Type</span>
                <span className="font-semibold text-indigo-300 truncate block">
                  {creator.creatorType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Primary Niche</span>
                <span className="font-semibold text-white truncate block">
                  {creator.primaryNiche}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Platforms</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {creator.platforms.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Campaign</span>
                <span className="font-semibold text-white truncate block">
                  {campaign.title}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Budget</span>
                <span className="font-semibold text-emerald-400 font-mono tabular-nums truncate block">
                  PKR {campaign.budget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Pitch Type & Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pitch Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Pitch Format</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setPitchType('instagram_dm');
                    void handleGenerate('instagram_dm', tone);
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    pitchType === 'instagram_dm'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">IG DM</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPitchType('email');
                    void handleGenerate('email', tone);
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    pitchType === 'email'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPitchType('short_message');
                    void handleGenerate('short_message', tone);
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    pitchType === 'short_message'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Short</span>
                </button>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tone</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                {(['professional', 'friendly', 'concise'] as PitchTone[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTone(t);
                      void handleGenerate(pitchType, t);
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                      tone === t
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Pitch Editor / Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Generated Pitch (Editable)</span>
              </span>

              {isAiGenerated && (
                <span className="text-[11px] font-medium text-indigo-400/90 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Gemini Verified Fit
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="h-56 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                <p className="text-xs font-medium text-slate-300">
                  Generating personalized pitch...
                </p>
                <p className="text-[11px] text-slate-500">
                  Analyzing {creator.name}&apos;s profile fit with {campaign.title}
                </p>
              </div>
            ) : error ? (
              <div className="h-56 bg-red-950/20 border border-red-900/40 rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <p className="text-xs font-semibold text-red-300">{error}</p>
                <button
                  type="button"
                  onClick={() => void handleGenerate(pitchType, tone)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pitchType === 'email' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={subjectText}
                      onChange={(e) => setSubjectText(e.target.value)}
                      placeholder="Email subject line..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    Message Body
                  </label>
                  <textarea
                    rows={pitchType === 'email' ? 7 : 5}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type or edit your personalized pitch here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs leading-relaxed text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y custom-scrollbar"
                  />
                </div>

                {/* Personalization Points */}
                {personalizationPoints.length > 0 && (
                  <div className="bg-slate-950/50 border border-slate-800/60 rounded-lg p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Why this pitch was personalized
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                      {personalizationPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                          <span className="leading-tight">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleGenerate(pitchType, tone)}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              disabled={isLoading || !messageText.trim()}
              onClick={() => void handleCopy()}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Pitch</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isLoading || !messageText.trim()}
              onClick={handleContinue}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <span>Continue to Proposal</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
