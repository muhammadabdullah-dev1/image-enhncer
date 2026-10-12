import React from 'react';
import { Sparkles, Sliders, HelpCircle, ShieldCheck } from 'lucide-react';
import { ProcessingEngine } from '../types';

interface HeaderProps {
  activeEngine: ProcessingEngine;
  onOpenSettings: () => void;
  onOpenHowItWorks: () => void;
  onOpenPrivacy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeEngine,
  onOpenSettings,
  onOpenHowItWorks,
  onOpenPrivacy,
}) => {
  const engineLabel =
    activeEngine === 'gemini'
      ? 'Gemini AI Active'
      : activeEngine === 'replicate'
      ? 'Neural Real-ESRGAN'
      : 'High-Precision Engine';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            PixelBoost AI
          </span>
        </div>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#workspace"
            className="hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0"
          >
            Enhancer
          </a>
          <button
            onClick={onOpenHowItWorks}
            className="hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            How It Works
          </button>
          <button
            onClick={onOpenPrivacy}
            className="hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            Privacy & Processing
          </button>
        </nav>

        {/* Zone 3: 1 primary action / status button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            title="Configure AI API keys & processing pipeline"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>{engineLabel}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
