import React from 'react';
import { X, Layers, Sparkles, Shield, Cpu, Sliders } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">How PixelBoost AI Works</h3>
              <p className="text-xs text-slate-500">
                The science behind super-resolution and image enhancement
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
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Stepped Resampling (2×, 3×, 4×)
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Rather than nearest-neighbor or single-step linear scaling that causes blurry pixelation,
                we employ multi-tier stepped interpolation. When scaling to 4×, the image passes through
                sub-resampling matrices to prevent blocky artifacts and retain geometric sharpness.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Unsharp Mask Convolution & Detail Recovery
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                An adaptive Laplacian difference matrix calculates high-frequency edge gradients.
                Micro-textures are amplified along contours, bringing out fine hairs, fabric weaves,
                and architectural lines without creating unnatural white halos.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                Bilateral Noise Suppression
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                JPEG compression and camera sensors introduce noisy pixel speckles. Our bilateral
                smoothing filter discriminates between real edges and noise, eliminating grainy artifacts
                while preserving crisp silhouettes.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Dedicated AI Models (Gemini & Real-ESRGAN)
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                When external AI models are enabled in Settings, the server connects to Google Gemini GenAI
                or neural super-resolution endpoints to generate synthetic photorealistic details.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
