import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreProvider';
import { Play, Pause } from 'lucide-react';
import clsx from 'clsx';

const AudioPlayer = observer(({ url, isPlaying, onAudioPreview }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && url) {
      if (!audioRef.current.src) {
        audioRef.current.src = url;
      }
      audioRef.current.play().catch(err => console.error('Audio play failed:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, url]);

  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
        isPlaying
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
      onClick={() => onAudioPreview && onAudioPreview(!isPlaying)}
    >
      {isPlaying ? (
        <>
          <Pause size={16} />
          <span>Pause</span>
        </>
      ) : (
        <>
          <Play size={16} />
          <span>Play</span>
        </>
      )}
    </button>
  );
});

export default AudioPlayer;
