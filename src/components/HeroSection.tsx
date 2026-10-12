import React from 'react';
import { Sparkles, Layers, Image as ImageIcon } from 'lucide-react';

interface HeroSectionProps {
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLoadSamples,
  isLoadingSamples,
}) => {
  return (
    <section className="pt-10 pb-8 text-center max-w-4xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 balance">
        Make Every Image Look Sharper.
      </h1>
      <p className="mt-3.5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Enhance and upscale multiple images in one simple workflow. Enlarge by 2×, 3×, or 4×
        with detail recovery, adaptive noise reduction, and smart contrast balance.
      </p>

      {/* Unboxed Metadata Features Strip */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          Bulk Batch Queue
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>2×, 3× & 4× Super-Resolution</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>Lossless PNG, WebP & JPEG</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>1-Click ZIP Export</span>
      </div>

      {/* Instant Demo Prompt */}
      <div className="mt-5">
        <button
          onClick={onLoadSamples}
          disabled={isLoadingSamples}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200/80 transition-colors cursor-pointer disabled:opacity-50"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>{isLoadingSamples ? 'Loading high-res samples...' : 'Try with 3 High-Res Sample Photos'}</span>
        </button>
      </div>
    </section>
  );
};
