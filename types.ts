export enum ProcessingStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ProcessedImage {
  id: string;
  file: File;
  originalPreviewUrl: string;
  generatedUrl: string | null;
  status: ProcessingStatus;
  errorMsg?: string;
  // Meta data for advanced tools (e.g., Variant Type)
  meta?: {
    type: string;
    label: string;
    [key: string]: any;
  };
}

export interface ImageProcessingStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
}

// Declaration for global JSZip and saveAs since we are loading via CDN script tags
declare global {
  interface Window {
    JSZip: any;
    saveAs: any;
  }
}