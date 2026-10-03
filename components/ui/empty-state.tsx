'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  badge,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-all ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-sm shrink-0">
        <Icon className="w-7 h-7" />
      </div>

      {badge && (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800/90 text-indigo-300 border border-slate-700/80 mb-3 inline-block font-mono">
          {badge}
        </span>
      )}

      <h3 className="text-lg sm:text-xl font-bold text-white font-['Syne',sans-serif] tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed mt-2">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer ${
                action.variant === 'secondary'
                  ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700'
                  : 'text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {action.icon && React.createElement(action.icon, { className: 'w-4 h-4' })}
              <span>{action.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              {secondaryAction.icon &&
                React.createElement(secondaryAction.icon, { className: 'w-4 h-4' })}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
