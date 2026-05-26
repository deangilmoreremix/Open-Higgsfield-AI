import React, { useState, useCallback, useRef } from 'react';
import './ModernFileUpload.css';

const ModernFileUpload = ({
  onFileSelect,
  acceptedTypes = ['.txt', '.pdf', '.doc', '.docx'],
  maxSize = 10 * 1024 * 1024, // 10MB
  label = 'Upload File',
  description = 'Drag and drop your file here, or click to browse'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      throw new Error(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    return true;
  };

  const processFile = useCallback(async (file) => {
    try {
      validateFile(file);
      setError('');
      setSelectedFile(file);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsUploading(false);
            onFileSelect(file);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

    } catch (err) {
      setError(err.message);
      setIsUploading(false);
      setSelectedFile(null);
    }
  }, [acceptedTypes, maxSize, onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <label className="file-upload-label">
        {label}
      </label>

      <div
        className={`file-upload-zone ${isDragOver ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''} ${error ? 'error' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={acceptedTypes.join(',')}
          className="file-input"
          aria-label="File upload"
        />

        {isUploading ? (
          <div className="upload-progress">
            <div className="progress-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <div className="progress-info">
              <h4>Uploading...</h4>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>{Math.round(uploadProgress)}% complete</p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="file-preview">
            <div className="file-icon">
              📄
            </div>
            <div className="file-info">
              <div className="file-name">{selectedFile.name}</div>
              <div className="file-size">{formatFileSize(selectedFile.size)}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="remove-file-btn"
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">
              📁
            </div>
            <div className="upload-content">
              <h4>{description}</h4>
              <p>Maximum file size: {(maxSize / (1024 * 1024)).toFixed(1)}MB</p>
              <div className="accepted-types">
                {acceptedTypes.join(', ')}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default ModernFileUpload;