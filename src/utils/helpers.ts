import { UpscaleFactor, OutputFormat } from '../types';

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDimensions(width: number, height: number): string {
  return `${width.toLocaleString()} × ${height.toLocaleString()} px`;
}

export function calculateOutputDimensions(
  width: number,
  height: number,
  scale: UpscaleFactor
): { width: number; height: number; megapixels: number } {
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);
  const megapixels = parseFloat(((newWidth * newHeight) / 1_000_000).toFixed(1));
  return { width: newWidth, height: newHeight, megapixels };
}

export function generateEnhancedFilename(
  originalFilename: string,
  scale: UpscaleFactor,
  format: OutputFormat = 'png'
): string {
  const dotIndex = originalFilename.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? originalFilename.substring(0, dotIndex) : originalFilename;
  const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${sanitized}_${scale}x_enhanced.${format}`;
}

export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'unknown';
    return {
      valid: false,
      error: `Unsupported format (.${ext}). Please upload JPG, PNG, or WebP images.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds the 25 MB limit.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The uploaded file is empty or corrupted (0 bytes).',
    };
  }

  return { valid: true };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error('Failed to decode image dimensions'));
    img.src = dataUrl;
  });
}
