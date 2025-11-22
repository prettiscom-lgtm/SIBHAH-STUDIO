import React from 'react';
import { X, Download, ArrowRight } from 'lucide-react';
import { ProcessedImage } from '../types';

interface ImageModalProps {
  item: ProcessedImage | null;
  onClose: () => void;
  onDownload: (item: ProcessedImage) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ item, onClose, onDownload }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{item.file.name}</h3>
            <p className="text-sm text-gray-500">Comparison View</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center justify-center">
            
            {/* Original */}
            <div className="flex flex-col gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                 <img 
                   src={item.originalPreviewUrl} 
                   alt="Original" 
                   className="w-full aspect-square object-contain bg-checkered rounded-md"
                 />
              </div>
              <div className="text-center font-medium text-gray-600 bg-white py-2 rounded-md shadow-sm">Original</div>
            </div>

            {/* Arrow for mobile/desktop flow */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg">
                <ArrowRight className="w-6 h-6 text-indigo-600" />
            </div>

            {/* Generated */}
            <div className="flex flex-col gap-3">
               <div className="bg-white p-2 rounded-lg shadow-sm ring-2 ring-indigo-100">
                 {item.generatedUrl ? (
                   <img 
                     src={item.generatedUrl} 
                     alt="Processed" 
                     className="w-full aspect-square object-contain bg-checkered rounded-md"
                   />
                 ) : (
                   <div className="w-full aspect-square flex items-center justify-center bg-gray-50 text-gray-400 rounded-md">
                     No Image
                   </div>
                 )}
               </div>
               <div className="text-center font-medium text-indigo-600 bg-white py-2 rounded-md shadow-sm">
                 Processed (Beige Cotton)
                </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => onDownload(item)}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Download Processed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
