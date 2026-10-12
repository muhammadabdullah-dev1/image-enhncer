import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageItem } from '../types';
import { formatDimensions, formatBytes } from '../utils/helpers';
import { Download, ZoomIn, ZoomOut, SplitSquareVertical, Columns } from 'lucide-react';
import { downloadSingleImage } from '../services/zipService';

interface BeforeAfterSliderProps {
  item: ImageItem;
  onClose?: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ item, onClose }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 3>(1);
  const [viewMode, setViewMode] = useState<'split' | 'sideBySide'>('split');

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percent = (clampedX / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, handleMove]);

  const enhancedSrc = item.enhancedDataUrl || item.originalDataUrl;
  const originalSrc = item.originalDataUrl;

  const originalDims = formatDimensions(item.originalWidth, item.originalHeight);
  const enhancedDims = formatDimensions(
    item.enhancedWidth || item.originalWidth * item.scale,
    item.enhancedHeight || item.originalHeight * item.scale
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 truncate max-w-sm">
              {item.filename}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              {item.scale}× Enhanced
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
            <span>Before: {originalDims}</span>
            <span aria-hidden="true" className="text-slate-300 font-sans">→</span>
            <span className="text-emerald-600 font-semibold">After: {enhancedDims}</span>
            {item.enhancedSize && (
              <>
                <span aria-hidden="true" className="text-slate-300 font-sans">·</span>
                <span>{formatBytes(item.enhancedSize)}</span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Split comparison slider"
            >
              <SplitSquareVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('sideBySide')}
              className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'sideBySide' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Side-by-side view"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom toggle */}
          <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => setZoomLevel((z) => (z === 1 ? 2 : z === 2 ? 3 : 1))}
              className="px-2 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              title="Toggle zoom inspection"
            >
              {zoomLevel === 1 ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
              <span>{zoomLevel}×</span>
            </button>
          </div>

          {/* Download button */}
          <button
            onClick={() => downloadSingleImage(item)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Close viewer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Image Display Area */}
      <div className="relative bg-slate-900 p-2 sm:p-4 overflow-hidden flex items-center justify-center min-h-[380px] max-h-[580px]">
        {viewMode === 'split' ? (
          <div
            ref={containerRef}
            className="relative select-none max-w-full max-h-[540px] overflow-hidden rounded-lg shadow-lg cursor-ew-resize"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Background: Enhanced Image */}
            <img
              src={enhancedSrc}
              alt="Enhanced version"
              referrerPolicy="no-referrer"
              className="max-h-[520px] w-auto object-contain block pointer-events-none"
            />

            {/* Foreground: Original Image with Clip Path */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
            >
              <img
                src={originalSrc}
                alt="Original version"
                referrerPolicy="no-referrer"
                className="max-h-[520px] w-auto object-contain block"
              />
            </div>

            {/* Slider Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)] cursor-ew-resize pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Central drag handle */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-800 shadow-md flex items-center justify-center text-xs font-bold pointer-events-auto border border-slate-300">
                ⇄
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded shadow-sm pointer-events-none">
              Original ({originalDims})
            </div>
            <div className="absolute bottom-3 right-3 bg-indigo-600/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-sm pointer-events-none">
              {item.scale}× Enhanced ({enhancedDims})
            </div>
          </div>
        ) : (
          /* Side-by-Side Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-h-[520px] overflow-auto">
            <div className="flex flex-col items-center">
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                <img
                  src={originalSrc}
                  alt="Original"
                  referrerPolicy="no-referrer"
                  className="max-h-[440px] w-auto object-contain"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded">
                  Original ({originalDims})
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                <img
                  src={enhancedSrc}
                  alt="Enhanced"
                  referrerPolicy="no-referrer"
                  className="max-h-[440px] w-auto object-contain"
                />
                <div className="absolute bottom-2 right-2 bg-indigo-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                  {item.scale}× Enhanced ({enhancedDims})
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer prompt */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Drag the slider horizontally to compare fine sharpness, textures, and edges.</span>
        <span className="font-mono tabular-nums">Divider: {Math.round(sliderPosition)}%</span>
      </div>
    </div>
  );
};
