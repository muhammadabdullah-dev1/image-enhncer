import React, { useState } from 'react';
import { ImageItem } from '../types';
import { formatDimensions, formatBytes } from '../utils/helpers';
import { Download, Archive, Eye, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { downloadSingleImage, exportImagesAsZip, ZipExportProgress } from '../services/zipService';

interface ResultsGalleryProps {
  items: ImageItem[];
  onPreviewItem: (item: ImageItem) => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({
  items,
  onPreviewItem,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<ZipExportProgress | null>(null);

  const completedItems = items.filter((item) => item.status === 'completed');

  if (completedItems.length === 0) return null;

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      setZipProgress(null);
      await exportImagesAsZip(completedItems, (progress) => {
        setZipProgress(progress);
      });
    } catch (err) {
      console.error('ZIP export failed:', err);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Enhanced Results ({completedItems.length})
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            All images successfully upscaled with detail recovery and color optimization.
          </p>
        </div>

        {/* Master ZIP Download Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isZipping ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {zipProgress ? `Archiving ${zipProgress.index}/${zipProgress.total}...` : 'Preparing ZIP...'}
              </span>
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              <span>Download All as ZIP ({completedItems.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Results */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {completedItems.map((item) => {
          const enhancedDims = formatDimensions(
            item.enhancedWidth || item.originalWidth * item.scale,
            item.enhancedHeight || item.originalHeight * item.scale
          );

          return (
            <div
              key={item.id}
              className="group border border-slate-200 hover:border-indigo-300 rounded-lg overflow-hidden bg-slate-50/50 hover:bg-white transition-all shadow-2xs hover:shadow-sm flex flex-col"
            >
              {/* Image Preview Container */}
              <div
                className="relative aspect-4/3 bg-slate-900 overflow-hidden cursor-pointer"
                onClick={() => onPreviewItem(item)}
              >
                <img
                  src={item.enhancedDataUrl || item.originalDataUrl}
                  alt={item.filename}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                  {item.scale}× Enhanced
                </div>

                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-md bg-white/95 text-slate-900 text-xs font-semibold shadow-sm flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    Compare Before/After
                  </span>
                </div>
              </div>

              {/* Card Meta & Download */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 truncate" title={item.filename}>
                    {item.filename}
                  </h4>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 font-mono tabular-nums">
                    <span>{enhancedDims}</span>
                    {item.enhancedSize && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{formatBytes(item.enhancedSize)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onPreviewItem(item)}
                    className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Compare</span>
                  </button>

                  <button
                    onClick={() => downloadSingleImage(item)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-600" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
