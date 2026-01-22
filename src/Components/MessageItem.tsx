import React, { useState } from 'react';
import type { Message } from './ChatArea';
import UnifiedMessage from "./UnifiedMessage"

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if message content is a base64 image (supports both PNG and JPEG)
  const isImage = () => {
    if (!message || typeof message.content !== 'string') return false;
    return message.content.startsWith('data:image/');
  };

  const handleDownloadImage = () => {
    if (isImage()) {
      const link = document.createElement('a');
      link.href = message.content;
      // Determine extension from data URL
      const ext = message.content.includes('image/png') ? 'png' : 'jpg';
      link.download = `image_${message.id}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    if (!message.content || message.content.trim() === '') {
      return <span className="text-gray-400 italic">Empty message</span>;
    }

    // If it's an image
    if (isImage() && !imageError) {
      return (
        <div className="image-container relative group">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="w-full h-32 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          <img
            src={message.content}
            alt="Shared image"
            className={`max-w-full h-auto rounded-lg border-2 ${
              isOwn ? 'border-white/30' : 'border-gray-200'
            } shadow-md cursor-pointer transition-transform hover:scale-[1.02] ${
              imageLoaded ? 'block' : 'hidden'
            }`}
            style={{ maxHeight: '250px', objectFit: 'contain' }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            onClick={() => setShowFullImage(true)}
          />
          
          {/* Image overlay actions */}
          {imageLoaded && !imageError && (
            <div className={`absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullImage(true);
                }}
                className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                title="View full size"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadImage();
                }}
                className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                title="Download image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          )}

          <p className={`text-xs mt-2 italic ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
            📷 Image
          </p>
        </div>
      );
    }

    // If image failed to load, show as regular message
    if (imageError && isImage()) {
      return <span className="text-gray-400 italic">Image could not be displayed</span>;
    }

    return <UnifiedMessage content={message.content} isOwnMessage={isOwn} />
  };

  return (
    <>
      <div className={`${isImage() ? 'max-w-[75%]' : 'max-w-[75%] md:max-w-[60%]'} p-3 rounded-lg ${isOwn
        ? 'bg-[#7B61FF] text-white'
        : 'bg-white text-black shadow-sm'
        }`}>
        <div className="message-content">
          {renderContent()}
        </div>
        <div className={`text-[12px] mt-1 ${isOwn ? 'text-white/70' : 'text-black/70'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Full image modal */}
      {showFullImage && isImage() && !imageError && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={message.content}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadImage();
              }}
              className="absolute bottom-2 right-2 px-4 py-2 bg-[#7B61FF] hover:bg-[#6B51EF] rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageItem;