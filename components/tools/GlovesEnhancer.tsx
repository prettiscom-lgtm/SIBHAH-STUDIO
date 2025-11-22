import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Trash2, Layers, Star } from 'lucide-react';
import ImageUploader from '../ImageUploader';
import ImageCard from '../ImageCard';
import ImageModal from '../ImageModal';
import { ProcessedImage, ProcessingStatus, ImageProcessingStats } from '../../types';
import { editGloveImage } from '../../services/glovesService';
import { fileToBase64, processImageToSpecifications, downloadImage, downloadAllImages } from '../../services/imageUtils';

const GlovesEnhancer: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const [referenceImageId, setReferenceImageId] = useState<string | null>(null);

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

  const handleSetReference = (id: string) => {
    setReferenceImageId(prev => (prev === id ? null : id));
  };

  const getReferenceBase64 = async (refId: string): Promise<string | undefined> => {
    const refImage = images.find(img => img.id === refId);
    if (!refImage || !refImage.generatedUrl) return undefined;

    try {
      const response = await fetch(refImage.generatedUrl);
      const blob = await response.blob();
      return await fileToBase64(new File([blob], "reference.jpg", { type: "image/jpeg" }));
    } catch (err) {
      console.error("Failed to load reference image", err);
      return undefined;
    }
  };

  // Parallel Processing Effect
  useEffect(() => {
    const processImage = async (img: ProcessedImage) => {
        try {
             setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: ProcessingStatus.PROCESSING } : i));

             const base64 = await fileToBase64(img.file);

             let referenceBase64: string | undefined = undefined;
             if (referenceImageId && referenceImageId !== img.id) {
                referenceBase64 = await getReferenceBase64(referenceImageId);
             }

             const rawBlob = await editGloveImage(base64, referenceBase64);
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

    // Find pending images and start them in parallel
    const pendingImages = images.filter(img => img.status === ProcessingStatus.PENDING);
    pendingImages.forEach(img => {
        processImage(img);
    });

  }, [images, referenceImageId]); // Re-run if images change or reference changes (though usually ref only affects NEW processing)

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
      const finalName = `${baseName}_glove.jpg`;
      downloadImage(blob, finalName);
    }
  };

  const handleDownloadAll = async () => {
    const successImages = images.filter(img => img.status === ProcessingStatus.SUCCESS && img.generatedUrl);
    if (successImages.length === 0) return;

    const blobsToZip = await Promise.all(successImages.map(async (img) => {
      const blob = await fetch(img.generatedUrl!).then(r => r.blob());
      const baseName = img.file.name.substring(0, img.file.name.lastIndexOf('.')) || img.file.name;
      return {
        filename: `${baseName}_glove.jpg`,
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
    setReferenceImageId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gloves Enhancer</h1>
            <p className="text-gray-600 mb-6">Refine glove fit and texture. Upload multiple images. Click "Set as Ref" on a successful result to standardize others.</p>
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
              isReference={referenceImageId === img.id}
              onRetry={handleRetry}
              onView={setSelectedImage}
              onDownload={handleDownloadOne}
              onSetReference={handleSetReference}
            />
          ))}
        </div>

        {images.length === 0 && (
            <div className="text-center py-20 opacity-50">
                <p className="text-gray-400">Upload images to start processing</p>
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

export default GlovesEnhancer;