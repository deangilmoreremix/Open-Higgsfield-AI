import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Upload, X, FileVideo, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { uploadMedia } from '../lib/supabase';

const supportedMimeTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'];

// Simplified media type detector
const getVideoMetadata = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        type: file.type || 'video/mp4'
      });
    };
    
    video.onerror = () => {
      resolve(null);
    };
    
    video.src = URL.createObjectURL(file);
  });
};

const VideoUpload = observer(({ onVideoUploaded, onClose, className = '' }) => {
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [videoMeta, setVideoMeta] = useState(null);
  const [trim, setTrim] = useState({ min: 0, max: 0 });
  const [waiter, setWaiter] = useState(null);

  const handleFileDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError("We're sorry, upload video size can't be more than 100MB.");
      return;
    }

    setWaiter({ message: 'Processing video...' });
    setError(null);

    try {
      const meta = await getVideoMetadata(file);
      if (!meta) {
        setError('This media format is not supported. Please try to upload MP4 or WebM video file.');
        setWaiter(null);
        return;
      }

      setWaiter(null);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      const result = await uploadMedia(file, 'video');

      setVideoMeta({
        ...meta,
        source: result?.url || URL.createObjectURL(file),
        fileName: file.name,
        size: file.size
      });

      setTrim({ min: 0, max: Math.min(meta.duration, 60) });
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
      setWaiter(null);
    }
  }, []);

  const retrieveVideoFromUrl = useCallback(async () => {
    if (!url) return;
    
    setError(null);
    setIsUploading(true);
    setUploadProgress(1);

    try {
      setWaiter({ message: 'Fetching video data...' });

      const meta = await getVideoMetadata(url);
      if (!meta && !url.includes('youtube') && !url.includes('vimeo')) {
        throw new Error('This media format is not supported. Please try to upload MP4 or WebM video file.');
      }

      setWaiter(null);
      setVideoMeta({
        ...meta,
        source: url,
        duration: meta?.duration || 60
      });
      setTrim({ min: 0, max: Math.min(meta?.duration || 60, 60) });

    } catch (err) {
      setWaiter(null);
      setUploadProgress(0);
      setIsUploading(false);
      setError(err.message || 'Failed to retrieve video data.');
    }
  }, [url]);

  const submitVideo = useCallback(() => {
    if (!videoMeta) return;
    onVideoUploaded && onVideoUploaded(videoMeta.source, trim);
  }, [videoMeta, trim, onVideoUploaded]);

  const resetUpload = () => {
    setUrl('');
    setVideoMeta(null);
    setTrim({ min: 0, max: 0 });
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: supportedMimeTypes,
    onDrop: handleFileDrop,
    multiple: false,
    disabled: isUploading
  });

  return (
    <div className={`video-upload h-full flex flex-col ${className}`}>
      {waiter && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">{waiter.message}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5">
        {videoMeta ? (
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-700 uppercase mb-2">
              Trim your video (selected duration can't be longer than 60 seconds)
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={videoMeta.duration || 60}
                value={trim.max}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val - trim.min <= 60) {
                    setTrim({ ...trim, max: val });
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{trim.min.toFixed(2)}s</span>
                <span>{trim.max.toFixed(2)}s</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-500',
                isUploading ? 'hidden' : ''
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={32} className="text-blue-500" />
              </div>
              <h5 className="text-base font-medium mb-2">
                Click or drag your file here to start uploading it.
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                Maximum file size: 100MB. Format: MP4/WebM.
              </p>
              <p className="text-sm text-gray-600">
                After upload you will be prompted to select up to 60 seconds
                for use in your project.
              </p>
            </div>

            {/* Upload Progress */}
            {isUploading && !videoMeta && (
              <div className="text-center">
                <h5 className="text-base font-medium mb-4">
                  {uploadProgress < 100 ? `${uploadProgress}%` : 'Processing your media...'}
                </h5>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* External Video */}
            <div className={isUploading ? 'hidden' : ''}>
              <h5 className="mt-4 mb-2 text-sm font-medium text-gray-700">
                Or use link to external video hosting (YouTube, Vimeo, etc)
              </h5>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit/Reset Buttons */}
        <div className="flex gap-3 mt-4">
          {videoMeta && (
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors flex items-center gap-2"
              onClick={resetUpload}
            >
              <ArrowLeft size={16} />
              Upload Video
            </button>
          )}

          <button
            className={`px-6 py-2 rounded-md text-white font-medium transition-all ${
              videoMeta
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-blue-500 hover:bg-blue-600',
              (!url && !videoMeta) || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={videoMeta ? submitVideo : retrieveVideoFromUrl}
            disabled={(!url && !videoMeta) || isUploading}
          >
            {videoMeta ? (
              <span className="flex items-center gap-2">
                <Check size={16} /> Continue
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload size={16} /> Retrieve Video Data
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default VideoUpload;