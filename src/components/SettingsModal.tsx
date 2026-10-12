import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Cpu, Zap, Shield, RefreshCw } from 'lucide-react';
import { ProcessingEngine, EngineConfigResponse } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEngine: ProcessingEngine;
  onSelectEngine: (engine: ProcessingEngine) => void;
  concurrency: number;
  onConcurrencyChange: (concurrency: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeEngine,
  onSelectEngine,
  concurrency,
  onConcurrencyChange,
}) => {
  const [config, setConfig] = useState<EngineConfigResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/engine-config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.warn('Could not fetch server engine config, running client mode', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Processing Engine & Settings</h3>
              <p className="text-xs text-slate-500">
                Select your enhancement pipeline and adjust batch performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Engine Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Processing Pipeline
              </label>
              <button
                onClick={fetchConfig}
                disabled={isLoading}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* 1. Algorithmic */}
              <div
                onClick={() => onSelectEngine('algorithmic')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeEngine === 'algorithmic'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        High-Precision Algorithmic Pipeline (Default)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Stepped interpolation + Unsharp Mask & Bilateral Denoise. Runs directly in browser or server.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Ready & Unlimited
                    </span>
                    {activeEngine === 'algorithmic' && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                </div>
              </div>

              {/* 2. Gemini GenAI */}
              <div
                onClick={() => onSelectEngine('gemini')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeEngine === 'gemini'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Gemini AI Vision & Detail Enhancer
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Google GenAI vision analysis with intelligent perceptual clarity and noise reconstruction.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        config?.hasGeminiKey
                          ? 'text-indigo-700 bg-indigo-50'
                          : 'text-amber-700 bg-amber-50'
                      }`}
                    >
                      {config?.hasGeminiKey ? 'API Key Detected' : 'Checks Runtime Key'}
                    </span>
                    {activeEngine === 'gemini' && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                </div>
              </div>

              {/* 3. Replicate Real-ESRGAN */}
              <div
                onClick={() => onSelectEngine('replicate')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeEngine === 'replicate'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Real-ESRGAN Super-Resolution (Replicate)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Dedicated GAN neural super-resolution network for realistic detail reconstruction.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        config?.hasReplicateToken
                          ? 'text-purple-700 bg-purple-50'
                          : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      {config?.hasReplicateToken ? 'Configured' : 'Needs REPLICATE_API_TOKEN'}
                    </span>
                    {activeEngine === 'replicate' && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Concurrency */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Batch Concurrency Limit
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onConcurrencyChange(num)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    concurrency === num
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {num} {num === 1 ? 'image at a time (Sequential)' : 'parallel images'}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Controlled concurrency prevents browser memory pressure when processing massive multi-megapixel files.
            </p>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-600">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Zero-Storage Guarantee:</strong> Your uploaded images are never saved permanently to disk or databases. Temporary object allocations are released as soon as downloads or processing finish.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
