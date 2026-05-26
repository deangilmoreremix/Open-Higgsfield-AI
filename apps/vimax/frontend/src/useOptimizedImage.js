import { useState, useEffect } from 'react';

const useOptimizedImage = (src, { width, height, quality = 80 }) => {
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setError(null);

    const img = new Image();

    img.onload = () => {
      try {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        // Calculate aspect ratio and positioning
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
          // Image is wider than canvas
          drawHeight = height;
          drawWidth = height * imgAspect;
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller than canvas
          drawWidth = width;
          drawHeight = width / imgAspect;
          offsetX = 0;
          offsetY = (height - drawHeight) / 2;
        }

        // Draw and compress
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setOptimizedSrc(url);
              setIsLoading(false);
            } else {
              setError('Failed to compress image');
              setIsLoading(false);
            }
          },
          'image/jpeg',
          quality / 100
        );
      } catch (err) {
        setError('Failed to process image');
        setIsLoading(false);
      }
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };

    img.src = src;

    // Cleanup
    return () => {
      if (optimizedSrc) {
        URL.revokeObjectURL(optimizedSrc);
      }
    };
  }, [src, width, height, quality]);

  return { optimizedSrc, isLoading, error };
};

export default useOptimizedImage;