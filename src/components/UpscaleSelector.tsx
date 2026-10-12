import React from 'react';
import { UpscaleFactor, EnhancementMode, OutputFormat, ProcessingEngine } from '../types';
import { SlidersHorizontal, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface UpscaleSelectorProps {
  scale: UpscaleFactor;
  onScaleChange: (scale: UpscaleFactor) => void;
  mode: EnhancementMode;
  onModeChange: (mode: EnhancementMode) => void;
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;
  engine: ProcessingEngine;
  onEngineChange: (engine: ProcessingEngine) => void;
  isProcessing: boolean;
  sampleDimensions?: { width: number; height: number };
}

export const UpscaleSelector: React.FC<UpscaleSelectorProps> = ({
  scale,
  onScaleChange,
  mode,
  onModeChange,
  outputFormat,
  onOutputFormatChange,
  engine,
  onEngineChange,
  isProcessing,
  sampleDimensions,
}) => {
  // Estimated output example
  const estWidth = sampleDimensions ? Math.round(sampleDimensions.width * scale) : 1000 * scale;
  const estHeight = sampleDimensions ? Math.round(sampleDimensions.height * scale) : 800 * scale;
  const estMegapixels = ((estWidth * estHeight) / 1_000_000).toFixed(1);
  const isLargeOutput = parseFloat(estMegapixels) > 20;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-900">Upscaling & Enhancement Settings</h2>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Target: {estWidth.toLocaleString()} × {estHeight.toLocaleString()} px ({estMegapixels} MP)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Scale Factor Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Upscale Multiplier
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {([2, 3, 4] as UpscaleFactor[]).map((val) => (
              <button
                key={val}
                type="button"
                disabled={isProcessing}
                onClick={() => onScaleChange(val)}
                className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer disabled:opacity-50 ${
                  scale === val
                    ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="font-bold">{val}×</div>
                <div className="text-[10px] font-normal text-slate-400">
                  {val === 2 ? 'Double' : val === 3 ? 'Triple' : '4× Max'}
                </div>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            {scale === 2 && 'Fastest processing. Great for social media and web display.'}
            {scale === 3 && 'High clarity. Suitable for print graphics and detailed displays.'}
            {scale === 4 && 'Maximum resolution. Deep recovery for crops and fine textures.'}
          </p>
        </div>

        {/* 2. Enhancement Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Enhancement Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'balanced', label: 'Balanced', desc: 'Optimal' },
                { id: 'detail_recovery', label: 'Detail', desc: 'Sharper' },
                { id: 'noise_reduction', label: 'Denoise', desc: 'Clean' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={isProcessing}
                onClick={() => onModeChange(item.id)}
                className={`py-2 text-xs font-medium rounded-md transition-all cursor-pointer disabled:opacity-50 ${
                  mode === item.id
                    ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div>{item.label}</div>
                <div className="text-[10px] font-normal text-slate-400">{item.desc}</div>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            {mode === 'balanced' && 'Refined sharpening with natural edge and contrast balance.'}
            {mode === 'detail_recovery' && 'High-frequency micro-texture boost for photos with fine elements.'}
            {mode === 'noise_reduction' && 'Smooths sensor grain & compression artifacts without blurring edges.'}
          </p>
        </div>

        {/* 3. Output Format & Engine */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Output Format
            </label>
            <span className="text-[11px] text-slate-400 font-medium">Alpha preserved</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['png', 'webp', 'jpeg'] as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                disabled={isProcessing}
                onClick={() => onOutputFormatChange(fmt)}
                className={`py-2 text-xs font-medium uppercase rounded-md transition-all cursor-pointer disabled:opacity-50 ${
                  outputFormat === fmt
                    ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              {engine === 'algorithmic' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>High-Precision Algorithmic</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{engine === 'gemini' ? 'Gemini AI Vision' : 'Replicate Neural'}</span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={() => onEngineChange(engine === 'algorithmic' ? 'gemini' : 'algorithmic')}
              disabled={isProcessing}
              className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Switch to {engine === 'algorithmic' ? 'Gemini AI' : 'Algorithmic'}
            </button>
          </div>
        </div>
      </div>

      {isLargeOutput && (
        <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Notice: Output resolution exceeds 20 Megapixels. Upscaling high-resolution inputs to 4× may produce large file sizes. Processing will run smoothly in memory.
          </span>
        </div>
      )}
    </div>
  );
};
