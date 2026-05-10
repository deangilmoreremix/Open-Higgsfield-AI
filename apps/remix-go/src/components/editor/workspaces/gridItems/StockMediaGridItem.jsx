import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Download, Eye, User } from 'lucide-react';

const StockMediaGridItem = ({ item, onPreview, onDownload, onUse }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await onDownload(item);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUse = (e) => {
    e.stopPropagation();
    onUse(item);
  };

  const handlePreview = (e) => {
    e.stopPropagation();
    onPreview(item);
  };

  const isVideo = item.type === 'video';
  const thumbnailUrl = isVideo ? item.image : item.src?.medium || item.src?.large;
  const displayTitle = item.photographer || item.user?.name || 'Stock Media';

  return (
    <div
      className="relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '200px'
      }}
    >
      {/* Media Type Badge */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        {isVideo ? 'VIDEO' : 'PHOTO'}
      </div>

      {/* Attribution */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        <User size={10} />
        <span className="truncate max-w-20">{displayTitle}</span>
      </div>

      {/* Hover Overlay */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center gap-3 transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={handlePreview}
            title="Preview"
          >
            <Eye size={16} />
          </button>

          <button
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download & Save"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={16} />
            )}
          </button>
        </div>

        {/* Use Button */}
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
          onClick={handleUse}
        >
          Use in Editor
        </button>

        {/* Media Info */}
        <div className="text-white text-xs text-center">
          {item.width} × {item.height}
          {isVideo && item.duration && (
            <span className="ml-2">• {Math.round(item.duration)}s</span>
          )}
        </div>
      </div>

      {/* Video Play Icon (for video items) */}
      {isVideo && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white rounded-full p-1">
          <div className="w-4 h-4 flex items-center justify-center">
            <span className="text-xs">▶</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(StockMediaGridItem);