import React from 'react';
import { Eye, RefreshCw, Download, AlertCircle, CheckCircle, Loader2, Star, Sparkles } from 'lucide-react';
import { ProcessedImage, ProcessingStatus } from '../types';

interface ImageCardProps {
  item: ProcessedImage;
  isReference: boolean;
  onRetry: (id: string) => void;
  onView: (item: ProcessedImage) => void;
  onDownload: (item: ProcessedImage) => void;
  onSetReference: (id: string) => void;
  onGenerateGallery?: (item: ProcessedImage) => void; // Optional prop for Ecommerce tool
}

const ImageCard: React.FC<ImageCardProps> = ({ 
  item, 
  isReference, 
  onRetry, 
  onView, 
  onDownload, 
  onSetReference,
  onGenerateGallery
}) => {
  const isError = item.status === ProcessingStatus.ERROR;
  const isSuccess = item.status === ProcessingStatus.SUCCESS;
  const isProcessing = item.status === ProcessingStatus.PROCESSING;
  const isPending = item.status === ProcessingStatus.PENDING;

  return (
    <div className={`
      bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col group relative
      ${isReference ? 'ring-2 ring-amber-400 border-amber-400' : 'border border-gray-200'}
    `}>
      
      {/* Reference Badge */}
      {isReference && (
        <div className="absolute top-0 left-0 z-30 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-br-lg shadow-sm flex items-center">
          <Star className="w-3 h-3 mr-1 fill-current" /> Ref Style
        </div>
      )}

      {/* Variant Label Badge */}
      {item.meta?.label && (
        <div className="absolute top-0 right-0 z-30 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg shadow-sm flex items-center">
           {item.meta.label}
        </div>
      )}

      {/* Image Preview Area */}
      <div className="relative aspect-square bg-gray-100">
        {/* Show generated if success, otherwise original */}
        <img
          src={isSuccess && item.generatedUrl ? item.generatedUrl : item.originalPreviewUrl}
          alt={item.file.name}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isProcessing ? 'opacity-50' : 'opacity-100'}`}
        />
        
        {/* Status Overlay */}
        <div className="absolute top-2 left-2 z-10">
          {isProcessing && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm border border-blue-200">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 shadow-sm border border-gray-200">
              Queue
            </span>
          )}
          {isSuccess && !isReference && !item.meta?.label && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm border border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" /> Done
            </span>
          )}
          {isError && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 shadow-sm border border-red-200">
              <AlertCircle className="w-3 h-3 mr-1" /> Failed
            </span>
          )}
        </div>

        {/* Overlay Actions (Visible on Hover) */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2 z-20">
          {isSuccess && (
            <button 
              onClick={() => onView(item)}
              className="p-2 bg-white rounded-full text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg transform hover:scale-110"
              title="View Comparison"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Info & Actions Footer */}
      <div className="p-3 flex flex-col gap-2 flex-grow">
        <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-900 truncate flex-1" title={item.file.name}>
              {item.file.name}
            </p>
        </div>
        
        {isError && (
            <p className="text-xs text-red-500 line-clamp-2 h-8 bg-red-50 p-1 rounded">
                {item.errorMsg || "Unknown error"}
            </p>
        )}
        
        {!isError && (
            <p className="text-xs text-gray-400 flex items-center justify-between">
               <span>{isSuccess ? "Ready" : isProcessing ? "Refining..." : "Waiting..."}</span>
               {isSuccess && !isReference && !item.meta?.type && (
                 <button 
                    onClick={() => onSetReference(item.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center"
                    title="Use this image as a style guide for others"
                 >
                   <Star className="w-3 h-3 mr-1" /> Set as Ref
                 </button>
               )}
            </p>
        )}

        <div className="mt-auto pt-2 flex gap-2">
             {isSuccess ? (
                <>
                  <button
                      onClick={() => onRetry(item.id)}
                      className="flex-none px-2 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-indigo-600 rounded-md transition-colors border border-gray-200"
                      title="Redo this image"
                  >
                      <RefreshCw className="w-4 h-4" />
                  </button>
                  
                  {/* Generate Gallery Button (Only if provided and not already a variant) */}
                  {onGenerateGallery && !item.meta?.type && (
                    <button
                        onClick={() => onGenerateGallery(item)}
                        className="flex-none px-2 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors border border-purple-200"
                        title="Generate Gallery Variants"
                    >
                        <Sparkles className="w-4 h-4" />
                    </button>
                  )}

                  <button
                      onClick={() => onDownload(item)}
                      className="flex-1 flex items-center justify-center px-2 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
                  >
                      <Download className="w-4 h-4 mr-1" /> Download
                  </button>
                </>
             ) : isError ? (
                 <button
                    onClick={() => onRetry(item.id)}
                    className="w-full flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-200"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Job
                </button>
             ) : (
                <div className="w-full h-8 bg-gray-50 rounded animate-pulse border border-gray-100"></div>
             )}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;