/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Resizes an image blob to exactly 1000x1000 pixels and converts to JPEG.
 */
export const processImageToSpecifications = async (imageBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use high quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image covering the square
      // We want to fit the image into 1000x1000. 
      // If the source is not square, we might stretch or crop. 
      // The requirement implies strictly 1000x1000 output.
      // Standard behavior for "1:1 output" tasks is usually stretching if close, or fitting.
      // However, Gemini generation with 1:1 aspect ratio should be close. 
      // We will force stretch to fill 1000x1000 to meet exact pixel requirements.
      ctx.drawImage(img, 0, 0, 1000, 1000);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        'image/jpeg',
        0.95 // High JPEG quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load generated image for processing'));
    };

    img.src = url;
  });
};

/**
 * Triggers a download for a single Blob
 */
export const downloadImage = (blob: Blob, filename: string) => {
  if (window.saveAs) {
    window.saveAs(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/**
 * Zips multiple blobs and triggers download
 */
export const downloadAllImages = async (images: { filename: string; blob: Blob }[]) => {
  if (!window.JSZip) {
    console.error("JSZip not loaded");
    return;
  }

  const zip = new window.JSZip();
  
  images.forEach((img) => {
    zip.file(img.filename, img.blob);
  });

  const content = await zip.generateAsync({ type: "blob" });
  
  if (window.saveAs) {
    window.saveAs(content, "processed_gloves.zip");
  } else {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = "processed_gloves.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
