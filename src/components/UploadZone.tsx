import React, { useRef, useState } from 'react';
import { UploadCloud, Plus, AlertCircle, FileImage } from 'lucide-react';
import { validateImageFile } from '../utils/helpers';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  totalInQueue: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  isProcessing,
  totalInQueue,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else if (validation.error) {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setErrorMessage(errors.slice(0, 2).join('; ') + (errors.length > 2 ? ` and ${errors.length - 2} more.` : ''));
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!isProcessing && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isProcessing}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`group relative border-2 border-dashed rounded-xl p-8 sm:p-10 transition-all text-center cursor-pointer ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/60'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-semibold text-slate-900">
            {totalInQueue > 0 ? 'Drop more images here' : 'Drop your images here, or browse'}
          </h3>

          <p className="mt-1.5 text-xs text-slate-500 max-w-sm">
            Upload multiple JPG, PNG, or WebP files up to 25 MB each.
            Batch process them together.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:pointer-events-none"
            >
              <Plus className="w-4 h-4" />
              <span>{totalInQueue > 0 ? 'Add More Images' : 'Choose Images'}</span>
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
