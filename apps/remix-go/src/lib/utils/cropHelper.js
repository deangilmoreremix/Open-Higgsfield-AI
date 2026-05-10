import React from 'react';

export const modalContent = (options) => {
  const { recommendedResolution, imageMeta = {}, onFileUploaded } = options;
  return {
    content: <div className="canvas">
      {/* ImageCropper component would go here */}
      <p>Image Cropper Component - {imageMeta.name}</p>
    </div>,
    config: {
      titleBar: {
        enable: true,
        text: 'Please select image area to use in project',
      },
      fadeIn: true,
      fadeInSpeed: 250,
    },
  };
};

export const isResolutionWrong = (options) => {
  const { recommendedResolution, imageMeta = {} } = options;
  return (recommendedResolution && (recommendedResolution.width !== imageMeta.width
    || recommendedResolution.height !== imageMeta.height));
};

export function checkImageResolution(options) {
  const { imageMeta = {}, onFileUploaded } = options;
  if (isResolutionWrong(options)) {
    return modalContent(options);
  }
  onFileUploaded(imageMeta);
}

export default {
  modalContent,
  isResolutionWrong,
  checkImageResolution,
};
