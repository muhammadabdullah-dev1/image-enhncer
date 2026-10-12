export type UpscaleFactor = 2 | 3 | 4;

export type EnhancementMode = 'balanced' | 'detail_recovery' | 'noise_reduction';

export type OutputFormat = 'png' | 'jpeg' | 'webp';

export type ProcessingEngine = 'algorithmic' | 'gemini' | 'replicate';

export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface ImageItem {
  id: string;
  file: File;
  filename: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalDataUrl: string;
  status: ProcessingStatus;
  progress: number;
  error?: string | null;
  scale: UpscaleFactor;
  mode: EnhancementMode;
  engine: ProcessingEngine;
  outputFormat: OutputFormat;
  enhancedWidth?: number;
  enhancedHeight?: number;
  enhancedDataUrl?: string;
  enhancedBlob?: Blob;
  enhancedSize?: number;
  processingTimeMs?: number;
}

export interface EngineConfigResponse {
  hasGeminiKey: boolean;
  hasReplicateToken: boolean;
  defaultEngine: ProcessingEngine;
  availableEngines: {
    id: ProcessingEngine;
    name: string;
    description: string;
    isConfigured: boolean;
    type: 'ai' | 'algorithmic';
  }[];
  maxUploadSizeMb: number;
}

export interface BatchProcessingStats {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
}
