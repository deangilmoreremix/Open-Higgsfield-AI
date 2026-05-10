import React, { useState, useRef } from 'react';

const AudioGridItem = ({ item, onUse }) => {
  const { artwork, url, title } = item;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const onAudioPreview = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Stop all other playing audios
        document.querySelectorAll('audio').forEach(audio => {
          if (audio !== audioRef.current) {
            audio.pause();
          }
        });
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div 
      className="relative rounded-lg overflow-hidden h-48 bg-cover bg-center"
      style={{ backgroundImage: `url(${artwork || '/images/editor/default-artwork.png'})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        <audio
          ref={audioRef}
          src={url}
          onEnded={() => setIsPlaying(false)}
        />
        <button
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
          onClick={onAudioPreview}
        >
          {isPlaying ? (
            <span className="text-2xl">⏸</span>
          ) : (
            <span className="text-2xl">▶</span>
          )}
        </button>
        <p className="text-white text-sm">{title}</p>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          onClick={() => onUse(url)}
        >
          Use
        </button>
      </div>
    </div>
  );
};

AudioGridItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    url: PropTypes.string.isRequired,
    artwork: PropTypes.string,
  }),
  onUse: PropTypes.func.isRequired,
};

export default AudioGridItem;
