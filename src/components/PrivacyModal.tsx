import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Trash2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Privacy & Processing Architecture</h3>
              <p className="text-xs text-slate-500">
                How your photos and creative assets are handled
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Ephemeral In-Memory Processing</h4>
              <p className="mt-1 text-slate-600">
                PixelBoost AI processes your images strictly in-memory. We do not write your photos to
                any persistent database or long-term storage buckets.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Client-Side Algorithmic Execution</h4>
              <p className="mt-1 text-slate-600">
                When using the default High-Precision Algorithmic Pipeline, your images never leave your
                browser. Upscaling, unsharp masking, and noise reduction occur 100% on your device.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Automatic Memory Garbage Collection</h4>
              <p className="mt-1 text-slate-600">
                Large upscaled images (e.g. 4× upscaling generating 25+ Megapixels) can consume significant RAM.
                Temporary object URLs are automatically revoked when you remove items, clear the queue, or download files.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
