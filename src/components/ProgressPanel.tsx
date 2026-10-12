import React from 'react';
import { Play, Square, CheckCircle2, RotateCcw } from 'lucide-react';
import { BatchProcessingStats, ProcessingEngine } from '../types';

interface ProgressPanelProps {
  stats: BatchProcessingStats;
  isProcessing: boolean;
  activeFilename?: string;
  onStartProcessing: () => void;
  onCancelProcessing: () => void;
  onRetryFailed: () => void;
  engine: ProcessingEngine;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({
  stats,
  isProcessing,
  activeFilename,
  onStartProcessing,
  onCancelProcessing,
  onRetryFailed,
  engine,
}) => {
  const total = stats.total;
  const completed = stats.completed;
  const failed = stats.failed;
  const remaining = stats.queued + stats.processing;
  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

  const canStart = stats.queued > 0 || (stats.failed > 0 && !isProcessing);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Summary Metrics */}
        <div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <span className="font-semibold text-slate-900">
              Total: {total} {total === 1 ? 'image' : 'images'}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold">{completed} completed</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500">{remaining} remaining</span>
            {failed > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-rose-600 font-semibold">{failed} failed</span>
              </>
            )}
          </div>

          {isProcessing && activeFilename && (
            <p className="mt-1.5 text-xs text-indigo-700 font-medium truncate max-w-md">
              Enhancing: <span className="font-semibold">{activeFilename}</span>...
            </p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {failed > 0 && !isProcessing && (
            <button
              onClick={onRetryFailed}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Retry Failed ({failed})</span>
            </button>
          )}

          {isProcessing ? (
            <button
              onClick={onCancelProcessing}
              className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-rose-700" />
              <span>Cancel Processing</span>
            </button>
          ) : (
            <button
              onClick={onStartProcessing}
              disabled={!canStart}
              className={`px-5 py-2.5 text-xs font-bold rounded-lg shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer ${
                canStart
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:shadow-indigo-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              {completed > 0 && stats.queued === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Batch Completed</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Enhance All Images ({stats.queued || total})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-mono tabular-nums">
            <span>Overall Progress</span>
            <span className="font-semibold text-slate-700">{percentComplete}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
