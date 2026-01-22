import React, { useState, useRef, useCallback } from 'react';

/**
 * FileUploadModal - Secure File Upload Component
 * All security features work silently in the background
 */

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (base64Content: string) => void;
}

interface FilePreview {
  originalFile: File;
  sanitizedName: string;
  previewUrl: string;
  processedBase64: string;
  dimensions: { width: number; height: number };
  fileSize: number;
}

// Security Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max
const MAX_IMAGE_DIMENSION = 4096;
const MAX_OUTPUT_SIZE = 90000;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sanitize filename (security: prevents path traversal)
  const sanitizeFilename = (filename: string): string => {
    const nameOnly = filename.split(/[/\\]/).pop() || 'image';
    return nameOnly.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100) || 'uploaded_image';
  };

  // Get file extension
  const getExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Process and compress image using canvas (strips EXIF, sanitizes content)
  const processImage = useCallback((file: File): Promise<{ base64: string; dimensions: { width: number; height: number } }> => {
    return new Promise((resolve, reject) => {
      // Basic validation
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`));
        return;
      }

      const ext = getExtension(file.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        reject(new Error(`File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
        return;
      }

      // Read file as data URL using FileReader (most reliable method)
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        if (!dataUrl) {
          reject(new Error('Could not read file'));
          return;
        }

        // Create image from data URL
        const img = new Image();
        
        img.onload = () => {
          try {
            // Validate dimensions
            if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
              reject(new Error(`Image too large. Maximum ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION} pixels`));
              return;
            }

            if (img.width === 0 || img.height === 0) {
              reject(new Error('Invalid image dimensions'));
              return;
            }

            // Calculate output dimensions
            let width = img.width;
            let height = img.height;
            const maxDim = 800;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height / width) * maxDim);
                width = maxDim;
              } else {
                width = Math.round((width / height) * maxDim);
                height = maxDim;
              }
            }

            // Create canvas and draw image (this strips EXIF and sanitizes)
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not create canvas'));
              return;
            }

            // White background for transparency
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            
            // Draw image (strips all metadata including EXIF)
            ctx.drawImage(img, 0, 0, width, height);

            // Progressive compression to fit size limit
            let quality = 0.85;
            let result = canvas.toDataURL('image/jpeg', quality);

            while (result.length > MAX_OUTPUT_SIZE && quality > 0.3) {
              quality -= 0.05;
              result = canvas.toDataURL('image/jpeg', quality);
            }

            // If still too big, reduce dimensions
            if (result.length > MAX_OUTPUT_SIZE) {
              const scale = Math.sqrt(MAX_OUTPUT_SIZE / result.length) * 0.9;
              canvas.width = Math.round(width * scale);
              canvas.height = Math.round(height * scale);
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              result = canvas.toDataURL('image/jpeg', 0.7);
            }

            resolve({
              base64: result,
              dimensions: { width: canvas.width, height: canvas.height }
            });
          } catch (err) {
            reject(new Error('Failed to process image'));
          }
        };

        img.onerror = () => {
          reject(new Error('Could not load image. Please try a different file.'));
        };

        // Set crossOrigin before src to avoid CORS issues
        img.crossOrigin = 'anonymous';
        img.src = dataUrl;
      };

      reader.onerror = () => {
        reject(new Error('Could not read file'));
      };

      reader.readAsDataURL(file);
    });
  }, []);

  // Handle file selection
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setFilePreview(null);

    try {
      const { base64, dimensions } = await processImage(file);
      
      setFilePreview({
        originalFile: file,
        sanitizedName: sanitizeFilename(file.name),
        previewUrl: base64,
        processedBase64: base64,
        dimensions,
        fileSize: file.size,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [processImage]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (filePreview) {
      onUpload(filePreview.processedBase64);
      setFilePreview(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setFilePreview(null);
    setError(null);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7B61FF] to-[#5B41DF] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Upload Image</h2>
                <p className="text-white/70 text-sm">Share photos in your chat</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!filePreview ? (
            <>
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${isDragging 
                    ? 'border-[#7B61FF] bg-[#7B61FF]/5 scale-[1.02]' 
                    : 'border-gray-300 hover:border-[#7B61FF] hover:bg-gray-50'
                  }
                `}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium">Processing image...</p>
                  </div>
                ) : (
                  <>
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-[#7B61FF]' : 'bg-[#7B61FF]/10'}`}>
                      <svg className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-[#7B61FF]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-semibold text-lg mb-1">
                      {isDragging ? 'Drop your image here' : 'Drag & drop your image'}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">or click to browse</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['JPEG', 'PNG', 'GIF', 'WebP'].map((format) => (
                        <span key={format} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                          {format}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-gray-400">Max file size: 10MB</p>
            </>
          ) : (
            <>
              {/* File Preview */}
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img
                    src={filePreview.previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-contain"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-lg text-white text-xs">
                    {filePreview.dimensions.width} × {filePreview.dimensions.height}
                  </div>
                </div>

                {/* File Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-[#7B61FF]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#7B61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{filePreview.sanitizedName}</p>
                    <p className="text-sm text-gray-500">
                      Original: {formatFileSize(filePreview.fileSize)} • Optimized: {formatFileSize(filePreview.processedBase64.length * 0.75)}
                    </p>
                  </div>
                </div>

                {/* Ready indicator */}
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-800 font-medium text-sm">Ready to send</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          {filePreview && (
            <button
              onClick={handleUpload}
              className="px-6 py-2 bg-[#7B61FF] hover:bg-[#6B51EF] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
