import React from 'react';
import { ImageItem, UpscaleFactor } from '../types';
import { formatBytes, formatDimensions, calculateOutputDimensions } from '../utils/helpers';
import { Trash2, RotateCcw, CheckCircle2, Clock, AlertCircle, Eye, Loader2 } from 'lucide-react';

interface ImageQueueProps {
  items: ImageItem[];
  selectedScale: UpscaleFactor;
  isProcessing: boolean;
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  onRetryItem: (id: string) => void;
  onPreviewItem: (item: ImageItem) => void;
}

export const ImageQueue: React.FC<ImageQueueProps> = ({
  items,
  selectedScale,
  isProcessing,
  onRemoveItem,
  onClearQueue,
  onRetryItem,
  onPreviewItem,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Queue Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Image Queue ({items.length})
          </h2>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500">
            {items.filter((i) => i.status === 'completed').length} enhanced
          </span>
        </div>

        <button
          onClick={onClearQueue}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Queue</span>
        </button>
      </div>

      {/* Queue Items List */}
      <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
        {items.map((item) => {
          const targetDims = calculateOutputDimensions(
            item.originalWidth,
            item.originalHeight,
            selectedScale
          );

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4 transition-colors ${
                item.status === 'processing'
                  ? 'bg-indigo-50/40'
                  : item.status === 'completed'
                  ? 'hover:bg-slate-50/60'
                  : item.status === 'failed'
                  ? 'bg-rose-50/30'
                  : 'hover:bg-slate-50/50'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={item.enhancedDataUrl || item.originalDataUrl}
                  alt={item.filename}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {item.status === 'completed' && (
                  <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {item.filename}
                  </span>

                  {/* Clean unboxed status */}
                  <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium">
                    {item.status === 'queued' && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Waiting
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="text-indigo-600 flex items-center gap-1 font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        Processing {item.progress}%
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Ready
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-rose-600 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Dimension & File size specs */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 font-mono tabular-nums">
                  <span>{formatBytes(item.originalSize)}</span>
                  <span aria-hidden="true" className="text-slate-300 font-sans">·</span>
                  <span>Orig: {formatDimensions(item.originalWidth, item.originalHeight)}</span>
                  <span aria-hidden="true" className="text-slate-300 font-sans">→</span>
                  <span className="text-indigo-600 font-semibold">
                    {selectedScale}×: {formatDimensions(targetDims.width, targetDims.height)}
                  </span>
                  {item.processingTimeMs && (
                    <>
                      <span aria-hidden="true" className="text-slate-300 font-sans">·</span>
                      <span className="text-slate-400">{(item.processingTimeMs / 1000).toFixed(1)}s</span>
                    </>
                  )}
                </div>

                {/* Processing bar */}
                {item.status === 'processing' && (
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, item.progress)}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {item.status === 'failed' && item.error && (
                  <p className="mt-1.5 text-xs text-rose-600 line-clamp-1">{item.error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {item.status === 'completed' && (
                  <button
                    onClick={() => onPreviewItem(item)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Compare Before & After"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                {item.status === 'failed' && (
                  <button
                    onClick={() => onRetryItem(item.id)}
                    disabled={isProcessing}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Retry enhancement"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onRemoveItem(item.id)}
                  disabled={isProcessing && item.status === 'processing'}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-30"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
