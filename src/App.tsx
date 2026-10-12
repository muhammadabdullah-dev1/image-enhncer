import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ImageItem,
  UpscaleFactor,
  EnhancementMode,
  OutputFormat,
  ProcessingEngine,
  BatchProcessingStats,
} from './types';
import { fileToDataUrl, getImageDimensions } from './utils/helpers';
import { processImage } from './services/imageProcessor';
import { SAMPLE_IMAGES } from './utils/sampleImages';

import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { UploadZone } from './components/UploadZone';
import { UpscaleSelector } from './components/UpscaleSelector';
import { ImageQueue } from './components/ImageQueue';
import { ProgressPanel } from './components/ProgressPanel';
import { ResultsGallery } from './components/ResultsGallery';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { HowItWorksModal } from './components/HowItWorksModal';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyModal } from './components/PrivacyModal';

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [scale, setScale] = useState<UpscaleFactor>(2);
  const [mode, setMode] = useState<EnhancementMode>('balanced');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [engine, setEngine] = useState<ProcessingEngine>('algorithmic');
  const [concurrency, setConcurrency] = useState<number>(2);

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilename, setActiveFilename] = useState<string>('');
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);

  // Active comparison modal
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);

  // Modals
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Abort controller ref for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync server engine config on mount
  useEffect(() => {
    fetch('/api/engine-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.hasGeminiKey) {
          // Both Gemini AI and High-Precision Algorithmic are ready
        }
      })
      .catch(() => {
        // Fallback to client-side algorithmic
      });
  }, []);

  // Compute batch statistics
  const stats: BatchProcessingStats = {
    total: items.length,
    queued: items.filter((i) => i.status === 'queued').length,
    processing: items.filter((i) => i.status === 'processing').length,
    completed: items.filter((i) => i.status === 'completed').length,
    failed: items.filter((i) => i.status === 'failed').length,
    cancelled: items.filter((i) => i.status === 'cancelled').length,
  };

  // Add files to queue
  const handleFilesSelected = async (files: File[]) => {
    const newItems: ImageItem[] = [];

    for (const file of files) {
      try {
        const dataUrl = await fileToDataUrl(file);
        const { width, height } = await getImageDimensions(dataUrl);

        newItems.push({
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          file,
          filename: file.name,
          originalSize: file.size,
          originalWidth: width,
          originalHeight: height,
          originalDataUrl: dataUrl,
          status: 'queued',
          progress: 0,
          scale,
          mode,
          engine,
          outputFormat,
        });
      } catch (err) {
        console.error('Failed to load image:', file.name, err);
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  // Instant demo: load generated sample photos
  const handleLoadSamples = async () => {
    try {
      setIsLoadingSamples(true);
      const newItems: ImageItem[] = [];

      for (const sample of SAMPLE_IMAGES) {
        // Fetch image asset as blob
        const res = await fetch(sample.path);
        const blob = await res.blob();
        const file = new File([blob], sample.filename, { type: 'image/jpeg' });
        const dataUrl = await fileToDataUrl(file);

        newItems.push({
          id: `sample_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          file,
          filename: sample.filename,
          originalSize: blob.size,
          originalWidth: sample.width,
          originalHeight: sample.height,
          originalDataUrl: dataUrl,
          status: 'queued',
          progress: 0,
          scale,
          mode,
          engine,
          outputFormat,
        });
      }

      setItems((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error('Failed to load sample images:', err);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.enhancedDataUrl && target.enhancedDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.enhancedDataUrl);
      }
      return prev.filter((i) => i.id !== id);
    });

    if (previewItem?.id === id) {
      setPreviewItem(null);
    }
  };

  // Clear entire queue
  const handleClearQueue = () => {
    items.forEach((item) => {
      if (item.enhancedDataUrl && item.enhancedDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.enhancedDataUrl);
      }
    });
    setItems([]);
    setPreviewItem(null);
  };

  // Update item in state
  const updateItemState = useCallback(
    (id: string, updates: Partial<ImageItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  // Process a single item
  const processSingleItem = useCallback(
    async (item: ImageItem, signal: AbortSignal) => {
      updateItemState(item.id, {
        status: 'processing',
        progress: 10,
        error: null,
        scale,
        mode,
        engine,
        outputFormat,
      });

      setActiveFilename(item.filename);

      try {
        const result = await processImage({
          dataUrl: item.originalDataUrl,
          originalWidth: item.originalWidth,
          originalHeight: item.originalHeight,
          scale,
          mode,
          engine,
          outputFormat,
          onProgress: (percent) => {
            updateItemState(item.id, { progress: percent });
          },
          signal,
        });

        updateItemState(item.id, {
          status: 'completed',
          progress: 100,
          enhancedDataUrl: result.dataUrl,
          enhancedBlob: result.blob,
          enhancedWidth: result.width,
          enhancedHeight: result.height,
          enhancedSize: result.sizeBytes,
          processingTimeMs: result.durationMs,
        });
      } catch (err: unknown) {
        if (signal.aborted) {
          updateItemState(item.id, { status: 'cancelled', progress: 0 });
          return;
        }
        const errorMsg = err instanceof Error ? err.message : String(err);
        updateItemState(item.id, {
          status: 'failed',
          progress: 0,
          error: errorMsg,
        });
      }
    },
    [scale, mode, engine, outputFormat, updateItemState]
  );

  // Batch processor with controlled concurrency
  const handleStartProcessing = async () => {
    if (isProcessing) return;

    // Items that need processing: queued or failed
    const pendingItems = items.filter(
      (item) => item.status === 'queued' || item.status === 'failed'
    );

    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Process with concurrency pool
      const queue = [...pendingItems];
      const running: Promise<void>[] = [];

      while (queue.length > 0 || running.length > 0) {
        if (signal.aborted) break;

        while (running.length < concurrency && queue.length > 0) {
          const nextItem = queue.shift()!;
          const p = processSingleItem(nextItem, signal).finally(() => {
            const index = running.indexOf(p);
            if (index !== -1) running.splice(index, 1);
          });
          running.push(p);
        }

        if (running.length > 0) {
          await Promise.race(running);
        }
      }
    } finally {
      setIsProcessing(false);
      setActiveFilename('');
      abortControllerRef.current = null;
    }
  };

  // Cancel processing
  const handleCancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setActiveFilename('');
  };

  // Retry single item
  const handleRetryItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item || isProcessing) return;

    const controller = new AbortController();
    setIsProcessing(true);
    try {
      await processSingleItem(item, controller.signal);
    } finally {
      setIsProcessing(false);
      setActiveFilename('');
    }
  };

  // Retry all failed
  const handleRetryAllFailed = () => {
    setItems((prev) =>
      prev.map((i) => (i.status === 'failed' ? { ...i, status: 'queued', error: null } : i))
    );
    setTimeout(() => {
      handleStartProcessing();
    }, 50);
  };

  // Find sample dimensions from first item for preview estimates
  const firstItem = items[0];
  const sampleDimensions = firstItem
    ? { width: firstItem.originalWidth, height: firstItem.originalHeight }
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* 3-Zone Top Navigation */}
      <Header
        activeEngine={engine}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero Section */}
        <HeroSection
          onLoadSamples={handleLoadSamples}
          isLoadingSamples={isLoadingSamples}
        />

        {/* Enhancement Workspace */}
        <section id="workspace" className="mt-4 space-y-6">
          {/* Upload Zone */}
          <UploadZone
            onFilesSelected={handleFilesSelected}
            isProcessing={isProcessing}
            totalInQueue={items.length}
          />

          {/* Upscale & Settings Panel */}
          {items.length > 0 && (
            <UpscaleSelector
              scale={scale}
              onScaleChange={setScale}
              mode={mode}
              onModeChange={setMode}
              outputFormat={outputFormat}
              onOutputFormatChange={setOutputFormat}
              engine={engine}
              onEngineChange={setEngine}
              isProcessing={isProcessing}
              sampleDimensions={sampleDimensions}
            />
          )}

          {/* Progress & Batch Action Bar */}
          {items.length > 0 && (
            <ProgressPanel
              stats={stats}
              isProcessing={isProcessing}
              activeFilename={activeFilename}
              onStartProcessing={handleStartProcessing}
              onCancelProcessing={handleCancelProcessing}
              onRetryFailed={handleRetryAllFailed}
              engine={engine}
            />
          )}

          {/* Uploaded Image Queue */}
          <ImageQueue
            items={items}
            selectedScale={scale}
            isProcessing={isProcessing}
            onRemoveItem={handleRemoveItem}
            onClearQueue={handleClearQueue}
            onRetryItem={handleRetryItem}
            onPreviewItem={(item) => setPreviewItem(item)}
          />

          {/* Results Gallery */}
          <ResultsGallery
            items={items}
            onPreviewItem={(item) => setPreviewItem(item)}
          />
        </section>
      </main>

      {/* Before / After Comparison Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-5xl">
            <BeforeAfterSlider
              item={previewItem}
              onClose={() => setPreviewItem(null)}
            />
          </div>
        </div>
      )}

      {/* Informational Modals */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeEngine={engine}
        onSelectEngine={setEngine}
        concurrency={concurrency}
        onConcurrencyChange={setConcurrency}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>PixelBoost AI</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Batch Multi-Pass Image Upscaler</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-slate-600 hover:text-indigo-600 cursor-pointer"
            >
              Privacy & Zero-Storage
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-600 hover:text-indigo-600 cursor-pointer"
            >
              API Engine Configuration
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
