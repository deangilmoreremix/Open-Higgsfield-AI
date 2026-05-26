import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({
  title = "Generating your video...",
  subtitle = "This may take a few minutes",
  steps = [
    { label: "Initializing AI models", status: "completed" },
    { label: "Processing your content", status: "processing" },
    { label: "Creating video assets", status: "pending" },
    { label: "Final rendering", status: "pending" }
  ],
  progress = 0
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-header">
          <div className="loading-spinner">
            <div className="spinner-orbit">
              <div className="spinner-core"></div>
              <div className="spinner-electron electron-1"></div>
              <div className="spinner-electron electron-2"></div>
              <div className="spinner-electron electron-3"></div>
            </div>
          </div>
          <h1 className="loading-title">{title}</h1>
          <p className="loading-subtitle">{subtitle}</p>
        </div>

        <div className="loading-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{Math.round(progress)}% Complete</div>
        </div>

        <div className="loading-steps">
          {steps.map((step, index) => (
            <div key={index} className={`loading-step step-${step.status}`}>
              <div className="step-indicator">
                {step.status === 'completed' && <span className="step-check">✓</span>}
                {step.status === 'processing' && <div className="step-spinner"></div>}
                {step.status === 'pending' && <span className="step-number">{index + 1}</span>}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="loading-hint">
          <p>Please don't close this window</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;