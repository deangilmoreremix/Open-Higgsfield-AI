import React, { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';

const VideoGridItem = ({ item, onPreview, onUse }) => {
  const { url, preview, title } = item;
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const togglePreview = (state) => {
    if (videoRef.current) {
      if (state) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div 
      className="relative rounded-lg overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${preview ? '' : '/images/editor/default-video-preview.png'})` }}
      onMouseOver={() => {
        setIsHovered(true);
        togglePreview(true);
      }}
      onMouseOut={() => {
        setIsHovered(false);
        togglePreview(false);
      }}
    >
      {(preview || url) && (
        <video
          className="w-full h-48 object-cover"
          preload="true"
          ref={videoRef}
          loop
          muted
        >
          {preview ? (
            <source src={preview} type="video/webm" />
          ) : (
            <source src={url} type="video/mp4" />
          )}
        </video>
      )}
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center gap-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <button
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(title, url);
          }}
        >
          <span className="text-2xl">▶</span>
        </button>
        <p className="text-white text-sm">{title}</p>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onUse(url);
          }}
        >
          Use
        </button>
      </div>
    </div>
  );
};

VideoGridItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    url: PropTypes.string.isRequired,
    preview: PropTypes.string.isRequired,
  }),
  onPreview: PropTypes.func,
  onUse: PropTypes.func.isRequired,
};

export default observer(VideoGridItem);
