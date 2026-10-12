import JSZip from 'jszip';
import { ImageItem } from '../types';
import { generateEnhancedFilename } from '../utils/helpers';

export interface ZipExportProgress {
  currentFile: string;
  index: number;
  total: number;
  percent: number;
}

export async function exportImagesAsZip(
  items: ImageItem[],
  onProgress?: (progress: ZipExportProgress) => void
): Promise<void> {
  const completedItems = items.filter(
    (item) => item.status === 'completed' && item.enhancedBlob
  );

  if (completedItems.length === 0) {
    throw new Error('No completed images available to download');
  }

  const zip = new JSZip();
  const folder = zip.folder('pixelboost_enhanced_images') || zip;

  for (let i = 0; i < completedItems.length; i++) {
    const item = completedItems[i];
    const filename = generateEnhancedFilename(item.filename, item.scale, item.outputFormat);

    onProgress?.({
      currentFile: filename,
      index: i + 1,
      total: completedItems.length,
      percent: Math.round(((i + 0.5) / completedItems.length) * 80),
    });

    if (item.enhancedBlob) {
      folder.file(filename, item.enhancedBlob);
    }
  }

  onProgress?.({
    currentFile: 'Compressing archive...',
    index: completedItems.length,
    total: completedItems.length,
    percent: 85,
  });

  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.({
        currentFile: 'Compressing archive...',
        index: completedItems.length,
        total: completedItems.length,
        percent: 85 + Math.round(metadata.percent * 0.15),
      });
    }
  );

  // Trigger download
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const zipFilename = `pixelboost_batch_${completedItems.length}_images_${timestamp}.zip`;

  const downloadUrl = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = zipFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 15000);
}

export function downloadSingleImage(item: ImageItem): void {
  if (!item.enhancedDataUrl && !item.enhancedBlob) {
    throw new Error('No enhanced image file is ready for download');
  }

  const filename = generateEnhancedFilename(item.filename, item.scale, item.outputFormat);
  const downloadUrl = item.enhancedBlob
    ? URL.createObjectURL(item.enhancedBlob)
    : item.enhancedDataUrl!;

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  if (item.enhancedBlob) {
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 15000);
  }
}
