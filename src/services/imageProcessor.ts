import { UpscaleFactor, EnhancementMode, OutputFormat, ProcessingEngine } from '../types';

export interface ProcessImageOptions {
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  scale: UpscaleFactor;
  mode: EnhancementMode;
  engine: ProcessingEngine;
  outputFormat: OutputFormat;
  onProgress?: (percent: number, statusText: string) => void;
  signal?: AbortSignal;
}

export interface ProcessImageResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  durationMs: number;
  engineUsed: ProcessingEngine;
}

export async function processImage(options: ProcessImageOptions): Promise<ProcessImageResult> {
  const {
    dataUrl,
    originalWidth,
    originalHeight,
    scale,
    mode,
    engine,
    outputFormat,
    onProgress,
    signal,
  } = options;

  const startTime = performance.now();

  if (signal?.aborted) {
    throw new Error('Processing cancelled by user');
  }

  // If AI engine is requested (gemini or replicate), invoke server-side endpoint
  if (engine === 'gemini' || engine === 'replicate') {
    onProgress?.(15, `Connecting to ${engine === 'gemini' ? 'Gemini AI' : 'Replicate'} super-resolution engine...`);

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: dataUrl,
          scale,
          mode,
          engine,
          outputFormat,
          width: originalWidth,
          height: originalHeight,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `AI server returned error code ${response.status}`);
      }

      onProgress?.(80, 'Finalizing neural enhanced resolution...');
      const resultData = await response.json();

      // Convert returned data URL / base64 to Blob
      const enhancedDataUrl: string = resultData.dataUrl;
      const blobRes = await fetch(enhancedDataUrl);
      const blob = await blobRes.blob();

      onProgress?.(100, 'Enhancement complete!');
      const durationMs = Math.round(performance.now() - startTime);

      return {
        dataUrl: enhancedDataUrl,
        blob,
        width: resultData.width || originalWidth * scale,
        height: resultData.height || originalHeight * scale,
        sizeBytes: blob.size,
        durationMs,
        engineUsed: engine,
      };
    } catch (err: unknown) {
      if (signal?.aborted) {
        throw new Error('Processing cancelled by user');
      }
      const errMessage = err instanceof Error ? err.message : String(err);
      // We do not silently swallow AI errors: we inform the user exactly what happened
      throw new Error(`AI Enhancement failed: ${errMessage}. You can retry or switch to the High-Precision Algorithmic pipeline in Settings.`);
    }
  }

  // --- High-Precision Multi-Pass Algorithmic Resampler Pipeline ---
  onProgress?.(10, 'Initializing high-fidelity interpolation pipeline...');

  // Step 1: Load image into HTML Image object
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image into memory'));
    image.src = dataUrl;
  });

  if (signal?.aborted) throw new Error('Processing cancelled by user');

  const targetWidth = Math.round(originalWidth * scale);
  const targetHeight = Math.round(originalHeight * scale);

  onProgress?.(30, `Upscaling to ${targetWidth} × ${targetHeight} (${scale}×)...`);

  // Step 2: Multi-step stepped resampling for pristine edge interpolation without blockiness
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Unable to create canvas 2D rendering context');
  }

  // Configure high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (scale === 2) {
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  } else {
    // Stepped resampling for 3x and 4x: draw to an intermediate step first to avoid aliasing
    const interCanvas = document.createElement('canvas');
    interCanvas.width = Math.round(originalWidth * (scale * 0.5));
    interCanvas.height = Math.round(originalHeight * (scale * 0.5));
    const interCtx = interCanvas.getContext('2d');
    if (interCtx) {
      interCtx.imageSmoothingEnabled = true;
      interCtx.imageSmoothingQuality = 'high';
      interCtx.drawImage(img, 0, 0, interCanvas.width, interCanvas.height);
      ctx.drawImage(interCanvas, 0, 0, targetWidth, targetHeight);
    } else {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    }
  }

  if (signal?.aborted) throw new Error('Processing cancelled by user');

  onProgress?.(60, `Applying ${mode === 'detail_recovery' ? 'texture recovery' : mode === 'noise_reduction' ? 'bilateral noise filter' : 'unsharp mask & clarity'}...`);

  // Step 3: Apply Pixel-Level Convolutions (Unsharp Mask, Noise Suppression, Contrast Balancing)
  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  applyEnhancementFilters(imgData, mode);
  ctx.putImageData(imgData, 0, 0);

  if (signal?.aborted) throw new Error('Processing cancelled by user');

  onProgress?.(90, `Encoding output as ${outputFormat.toUpperCase()}...`);

  // Step 4: Convert canvas to Blob & Data URL
  const mimeType = outputFormat === 'png' ? 'image/png' : outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
  const quality = outputFormat === 'png' ? 1 : 0.95;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to encode image to destination format'));
    }, mimeType, quality);
  });

  const outputDataUrl = URL.createObjectURL(blob);
  const durationMs = Math.round(performance.now() - startTime);

  onProgress?.(100, 'Processing complete!');

  return {
    dataUrl: outputDataUrl,
    blob,
    width: targetWidth,
    height: targetHeight,
    sizeBytes: blob.size,
    durationMs,
    engineUsed: 'algorithmic',
  };
}

/**
 * Pixel-level filter kernel application:
 * Unsharp masking, bilateral noise reduction, and subtle dynamic range tone mapping
 */
function applyEnhancementFilters(imageData: ImageData, mode: EnhancementMode) {
  const { data, width, height } = imageData;
  const original = new Uint8ClampedArray(data);

  // Kernel parameters based on mode
  let sharpenWeight = 0.5;
  let noiseThreshold = 12;
  let contrastBoost = 1.05;

  if (mode === 'detail_recovery') {
    sharpenWeight = 0.85;
    noiseThreshold = 8;
    contrastBoost = 1.08;
  } else if (mode === 'noise_reduction') {
    sharpenWeight = 0.3;
    noiseThreshold = 22;
    contrastBoost = 1.02;
  }

  // 3x3 Laplacian / Unsharp Filter Kernel with edge-preserving threshold
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      // Process R, G, B channels (preserve Alpha)
      for (let c = 0; c < 3; c++) {
        const center = original[idx + c];

        // 3x3 local neighborhood average
        const top = original[((y - 1) * width + x) * 4 + c];
        const bottom = original[((y + 1) * width + x) * 4 + c];
        const left = original[(y * width + (x - 1)) * 4 + c];
        const right = original[(y * width + (x + 1)) * 4 + c];

        const avgSurrounding = (top + bottom + left + right) * 0.25;
        const diff = center - avgSurrounding;

        let processedValue = center;

        // If in noise reduction mode and diff is small (high-frequency grain), smooth it
        if (mode === 'noise_reduction' && Math.abs(diff) < noiseThreshold) {
          processedValue = center * 0.4 + avgSurrounding * 0.6;
        } else {
          // Unsharp masking: add scaled high-frequency detail back
          processedValue = center + diff * sharpenWeight;
        }

        // Contrast balancing (pivot at midpoint 128)
        processedValue = (processedValue - 128) * contrastBoost + 128;

        data[idx + c] = Math.max(0, Math.min(255, processedValue));
      }
    }
  }
}
