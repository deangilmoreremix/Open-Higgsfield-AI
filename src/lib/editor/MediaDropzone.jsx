/**
 * Media Dropzone
 *
 * A react-dropzone wrapper that adds drag-and-drop file upload to any
 * container. Dropped files are routed through the unified
 * processFileUpload pipeline.
 *
 * This is additive: it does NOT replace or remove the existing
 * HTML5/mouse-based drag handlers in dragDrop.js. It adds a
 * react-dropzone-based drop zone for users who prefer that UX.
 *
 * Usage:
 *   <MediaDropzone state={state} showToast={showToast} onUpload={(r) => ...}>
 *     <div className="my-media-area">...</div>
 *   </MediaDropzone>
 *
 * The component renders the children inside a dropzone wrapper. When
 * files are dropped, it calls processFileUpload for each file and invokes
 * the optional onUpload callback with the result.
 */

import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { processFileUpload } from './uploadPipeline.js';

export function MediaDropzone({
  state,
  showToast,
  onUpload,
  accept = {
    'video/*': [],
    'audio/*': [],
    'image/*': [],
    'text/*': [],
    'application/pdf': ['.pdf']
  },
  multiple = true,
  maxSize = 500 * 1024 * 1024, // 500MB
  disabled = false,
  className = '',
  activeClassName = 'dropzone-active',
  children
}) {
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (disabled) return;
    // Show toasts for rejected files
    if (rejectedFiles && rejectedFiles.length > 0 && showToast) {
      for (const r of rejectedFiles) {
        const msg = r.errors && r.errors[0]
          ? `${r.file.name}: ${r.errors[0].message}`
          : `${r.file.name} was rejected`;
        showToast(msg, 'error');
      }
    }
    // Process accepted files through the unified pipeline
    for (const file of acceptedFiles) {
      const result = await processFileUpload(file, { state, showToast });
      if (typeof onUpload === 'function') onUpload(result, file);
    }
  }, [state, showToast, onUpload, disabled]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
    disabled
  });

  const computedClassName = useMemo(() => {
    const classes = ['media-dropzone'];
    if (isDragActive && !isDragReject) classes.push(activeClassName);
    if (isDragReject) classes.push('dropzone-reject');
    if (disabled) classes.push('dropzone-disabled');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [isDragActive, isDragReject, disabled, className, activeClassName]);

  return (
    <div {...getRootProps({ className: computedClassName })}>
      <input {...getInputProps()} />
      {children}
      {isDragActive && !isDragReject && (
        <div className="dropzone-overlay">
          <div className="dropzone-message">Drop files to upload</div>
        </div>
      )}
      {isDragReject && (
        <div className="dropzone-overlay dropzone-overlay-error">
          <div className="dropzone-message">Some files are not supported</div>
        </div>
      )}
    </div>
  );
}

export default MediaDropzone;
