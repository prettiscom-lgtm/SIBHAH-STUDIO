import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Trash2, Layers, AlertOctagon } from 'lucide-react';
import ImageUploader from '../ImageUploader';
import ImageCard from '../ImageCard';
import ImageModal from '../ImageModal';
import { ProcessedImage, ProcessingStatus, ImageProcessingStats } from '../../types';
import { createEcommerceShot, createEcommerceVariant } from '../../services/ecommerceService';
import { fileToBase64, processImageToSpecifications, downloadImage, downloadAllImages } from '../../services/imageUtils';

const EcommerceShotCreator: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);

  const stats: ImageProcessingStats = {
    total: images.length,
    completed: images.filter(i => i.status === ProcessingStatus.SUCCESS).length,
    failed: images.filter(i => i.status === ProcessingStatus.ERROR).length,
    processing: images.filter(i => i.status === ProcessingStatus.PROCESSING).length,
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleUpload = (files: File[]) => {
    const newImages: ProcessedImage[] = files.map(file => ({
      id: generateId(),
      file,
      originalPreviewUrl: URL.createObjectURL(file),
      generatedUrl: null,
      status: ProcessingStatus.PENDING,
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  // Function to spawn gallery placeholders
  const handleGenerateGallery = (item: ProcessedImage) => {
     const variants = [
        { type: 'Macro Detail', label: 'Macro' },
        { type: 'Lifestyle (Table)', label: 'Lifestyle' },
        { type: 'Packaging', label: 'Packaging' },
        { type: 'Hand Held', label: 'Hand Held' },
        { type: 'Context', label: 'Context' },
     ];

     const newVariants: ProcessedImage[] = variants.map(v => ({
        id: generateId(),
        file: item.file, // Reuse original file
        originalPreviewUrl: item.originalPreviewUrl,
        generatedUrl: null,
        status: ProcessingStatus.PENDING,
        meta: {
            type: v.type,
            label: `Gallery: ${v.label}`,
            parentId: item.id
        }
     }));

     setImages(prev => [...prev, ...newVariants]);
  };

  // Parallel Processing Effect
  useEffect(() => {
    const processImage = async (img: ProcessedImage) => {
        try {
            // Update status to processing
            setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: ProcessingStatus.PROCESSING } : i));

            const base64 = await fileToBase64(img.file);
            
            let rawBlob: Blob;

            // Check if this is a variant request or a main shot request
            if (img.meta && img.meta.type) {
                rawBlob = await createEcommerceVariant(base64, img.meta.type);
            } else {
                rawBlob = await createEcommerceShot(base64);
            }

            const processedBlob = await processImageToSpecifications(rawBlob);
            const processedUrl = URL.createObjectURL(processedBlob);

            setImages(prev => prev.map(i => 
                i.id === img.id ? { 
                ...i, 
                status: ProcessingStatus.SUCCESS, 
                generatedUrl: processedUrl 
                } : i
            ));

        } catch (error: any) {
            console.error("Processing failed for", img.id, error);
            setImages(prev => prev.map(i => 
                i.id === img.id ? { 
                ...i, 
                status: ProcessingStatus.ERROR, 
                errorMsg: error.message 
                } : i
            ));
        }
    };

    // Find all pending images and trigger processing for them in parallel
    const pendingImages = images.filter(img => img.status === ProcessingStatus.PENDING);
    
    pendingImages.forEach(img => {
        processImage(img);
    });

  }, [images]);


  const handleRetry = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, status: ProcessingStatus.PENDING, errorMsg: undefined } : img
    ));
  };

  const handleRetryFailed = () => {
    setImages(prev => prev.map(img => 
      img.status === ProcessingStatus.ERROR ? { ...img, status: ProcessingStatus.PENDING, errorMsg: undefined } : img
    ));
  };

  const handleDownloadOne = async (item: ProcessedImage) => {
    if (item.generatedUrl) {
      const blob = await fetch(item.generatedUrl).then(r => r.blob());
      let filename = item.file.name;
      const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
      const suffix = item.meta?.label ? `_${item.meta.label.replace(/\s/g, '')}` : '_flatlay';
      const finalName = `${baseName}${suffix}.jpg`;
      downloadImage(blob, finalName);
    }
  };

  const handleDownloadAll = async () => {
    const successImages = images.filter(img => img.status === ProcessingStatus.SUCCESS && img.generatedUrl);
    if (successImages.length === 0) return;

    const blobsToZip = await Promise.all(successImages.map(async (img) => {
      const blob = await fetch(img.generatedUrl!).then(r => r.blob());
      const baseName = img.file.name.substring(0, img.file.name.lastIndexOf('.')) || img.file.name;
      const suffix = img.meta?.label ? `_${img.meta.label.replace(/\s/g, '')}` : '_flatlay';
      return {
        filename: `${baseName}${suffix}.jpg`,
        blob: blob
      };
    }));

    downloadAllImages(blobsToZip);
  };

  const handleClearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalPreviewUrl);
      if (img.generatedUrl) URL.revokeObjectURL(img.generatedUrl);
    });
    setImages([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ecommerce Shot Creator</h1>
            <p className="text-gray-600 mb-6">Generate professional flat-lay photography for prayer beads. Straight, white background, and high detail. Click the sparkle icon on results to generate a full gallery.</p>
            <ImageUploader onUpload={handleUpload} isProcessing={false} />
        </div>

        {images.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm gap-4 sticky top-0 z-20">
             <div className="flex items-center gap-4">
                 <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Queue ({stats.completed}/{stats.total})
                 </h2>
             </div>
             
             <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                {stats.failed > 0 && (
                    <button 
                        onClick={handleRetryFailed}
                        className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 border border-red-200 text-sm font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Retry Failed ({stats.failed})
                    </button>
                )}
                
                <button 
                    onClick={handleClearAll}
                    className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 border border-gray-300 text-sm font-medium transition-colors"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Clear All
                </button>

                <button 
                    onClick={handleDownloadAll}
                    disabled={stats.completed === 0}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium shadow-sm transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" /> Download All
                </button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <ImageCard 
              key={img.id} 
              item={img}
              isReference={false}
              onRetry={handleRetry}
              onView={setSelectedImage}
              onDownload={handleDownloadOne}
              onSetReference={() => {}}
              onGenerateGallery={handleGenerateGallery}
            />
          ))}
        </div>

        {images.length === 0 && (
            <div className="text-center py-20 opacity-50">
                <p className="text-gray-400">Upload product images to start generation</p>
            </div>
        )}

      <ImageModal 
        item={selectedImage} 
        onClose={() => setSelectedImage(null)}
        onDownload={handleDownloadOne}
      />
    </div>
  );
};

export default EcommerceShotCreator;