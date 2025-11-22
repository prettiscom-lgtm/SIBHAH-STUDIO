import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, isProcessing }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isProcessing) return;
      
      const files = Array.from(e.dataTransfer.files).filter((file: File) => 
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onUpload(files);
      }
    },
    [onUpload, isProcessing]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((file: File) => 
        file.type.startsWith('image/')
      );
      onUpload(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
        ${isProcessing 
          ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60' 
          : 'border-indigo-300 bg-white hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer shadow-sm hover:shadow-md'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
          {isProcessing ? <Upload className="w-8 h-8 animate-pulse" /> : <ImageIcon className="w-8 h-8" />}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {isProcessing ? 'Processing Images...' : 'Upload Products Images'}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Drag & drop your images here, or click to browse.
            <br />
            <span className="text-xs text-gray-400">Supports JPG, PNG (Bulk Upload)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;