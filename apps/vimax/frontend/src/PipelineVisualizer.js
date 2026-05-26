import React from 'react';
import './PipelineVisualizer.css';

const PipelineVisualizer = ({ steps, currentStep, progress }) => {
  return (
    <div className="pipeline-visualization">
      <div className="pipeline-flow">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`pipeline-step ${step.status}`}>
              <div className="step-node">
                <div className="step-circle">
                  {step.status === 'completed' && '✓'}
                  {step.status === 'processing' && (
                    <div className="processing-spinner"></div>
                  )}
                  {step.status === 'pending' && index + 1}
                  {step.status === 'error' && '✕'}
                </div>
                <div className="step-content">
                  <div className="step-name">{step.name}</div>
                  <div className="step-duration">{step.estimatedTime}s</div>
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`pipeline-arrow ${currentStep > index ? 'active' : ''}`}>
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="pipeline-progress">
        <div className="progress-container">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {Math.round(progress)}% Complete
        </div>
      </div>
    </div>
  );
};

export default PipelineVisualizer;