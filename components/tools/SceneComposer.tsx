import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Trash2, Layers, Upload, Image as ImageIcon, X } from 'lucide-react';
import ImageUploader from '../ImageUploader';
import ImageCard from '../ImageCard';
import ImageModal from '../ImageModal';
import { ProcessedImage, ProcessingStatus, ImageProcessingStats } from '../../types';
import { composeScene } from '../../services/sceneService';
import { fileToBase64, processImageToSpecifications, downloadImage, downloadAllImages } from '../../services/imageUtils';

const SceneComposer: React.FC = () => {
  // Product Images Queue
  const [images, setImages] = useState<ProcessedImage[]>([]);
  
  // Scene/Reference Image State
  const [sceneFile, setSceneFile] = useState<File | null>(null);
  const [scenePreviewUrl, setScenePreviewUrl] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);

  const stats: ImageProcessingStats = {
    total: images.length,
    completed: images.filter(i => i.status === ProcessingStatus.SUCCESS).length,
    failed: images.filter(i => i.status === ProcessingStatus.ERROR).length,
    processing: images.filter(i => i.status === ProcessingStatus.PROCESSING).length,
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Handle Scene Upload (Single Image)
  const handleSceneUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSceneFile(file);
      setScenePreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearScene = () => {
    setSceneFile(null);
    if (scenePreviewUrl) URL.revokeObjectURL(scenePreviewUrl);
    setScenePreviewUrl(null);
  };

  // Handle Product Upload (Multiple Images)
  const handleProductUpload = (files: File[]) => {
    const newImages: ProcessedImage[] = files.map(file => ({
      id: generateId(),
      file,
      originalPreviewUrl: URL.createObjectURL(file),
      generatedUrl: null,
      status: ProcessingStatus.PENDING,
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  // Parallel Processing Effect
  useEffect(() => {
    if (!sceneFile) return;

    const processImage = async (img: ProcessedImage) => {
      try {
        // Mark as processing
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: ProcessingStatus.PROCESSING } : i));

        const productBase64 = await fileToBase64(img.file);
        const sceneBase64 = await fileToBase64(sceneFile); // sceneFile is guaranteed by check above
        
        const rawBlob = await composeScene(productBase64, sceneBase64);
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

  }, [images, sceneFile]);


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
      const finalName = `${baseName}_composed.jpg`;
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
        filename: `${baseName}_composed.jpg`,
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Scene Composer</h1>
            <p className="text-gray-600 mb-6">Smartly place products into any reference scene. The AI will detect and replace existing objects in the scene with your product.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Scene Selector */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                            <ImageIcon className="w-4 h-4 mr-2 text-indigo-500" />
                            Step 1: Reference Scene
                        </h3>
                        
                        {!sceneFile ? (
                            <label className="block w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-400 transition-colors cursor-pointer flex flex-col items-center justify-center">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Upload Scene</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleSceneUpload} />
                            </label>
                        ) : (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                                <img src={scenePreviewUrl!} alt="Scene" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                    <button 
                                        onClick={clearScene}
                                        className="bg-white text-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all shadow-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    Reference Background
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            Upload a scene (e.g., a table with a bottle). The AI will <b>remove the bottle</b> and place <b>your product</b> there.
                        </p>
                    </div>
                </div>

                {/* Right Column: Product Uploader */}
                <div className="lg:col-span-2">
                    <div className="h-full flex flex-col">
                         <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                            <Layers className="w-4 h-4 mr-2 text-indigo-500" />
                            Step 2: Product Images
                        </h3>
                         <div className="flex-1">
                            <ImageUploader onUpload={handleProductUpload} isProcessing={false} />
                         </div>
                         {!sceneFile && images.length > 0 && (
                             <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                                 <div className="flex">
                                     <div className="flex-shrink-0">
                                        <Upload className="h-5 w-5 text-amber-400" />
                                     </div>
                                     <div className="ml-3">
                                         <p className="text-sm text-amber-700 font-medium">
                                             Please upload a Reference Scene (Step 1) to start processing.
                                         </p>
                                     </div>
                                 </div>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </div>

        {/* Processing Queue / Results */}
        {images.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm gap-4 sticky top-0 z-20">
             <div className="flex items-center gap-4">
                 <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Composites ({stats.completed}/{stats.total})
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
            />
          ))}
        </div>

        {images.length === 0 && (
            <div className="text-center py-20 opacity-50">
                <p className="text-gray-400">Process flows from Step 1 to Step 2</p>
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

export default SceneComposer;