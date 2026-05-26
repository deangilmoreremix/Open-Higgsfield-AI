/* eslint-disable */
import React, { useRef } from 'react';
import './ContentStep.css';

const PIPELINE_INFO = {
  idea2video: {
    label: 'Idea2Video',
    accentColor: '#2563eb',
    acceptsReferenceVideo: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    steps: [
      'Type a plain-language description of your video concept below',
      'Be specific — mention tone, setting, audience, and key message',
      'Optionally click "Enhance with AI" to expand and refine your idea',
      'Hit Next and the AI will write the full script and generate your video',
    ],
    tip: 'The more context you give, the better the output. Include brand name, visual style, or target emotion.',
    inputLabel: 'Your Video Idea',
    placeholder: 'Describe your video concept in detail. The more specific you are, the better the result.\n\nExample: "A product launch video for a premium noise-canceling headphone brand — sleek design, urban professional setting, dramatic lighting, showing someone blocking out city noise to focus."',
    maxLength: 2000,
  },
  script2video: {
    label: 'Script2Video',
    accentColor: '#dc2626',
    acceptsReferenceVideo: true,
    referenceVideoLabel: 'Reference Footage',
    referenceVideoHint: 'Upload a video to guide the visual style and tone of each scene. MP4, MOV, or WebM up to 500 MB. Optional.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 3h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    steps: [
      'Paste your script directly into the text area, or upload a .txt / .md / .pdf file',
      'Use standard script format: scene headings (EXT./INT.), action lines, and dialogue',
      'Each scene heading becomes a separate video segment',
      'Hit Next and the AI will generate visuals for every scene in your script',
    ],
    tip: 'Scene headings like "EXT. CITY STREET - NIGHT" tell the AI exactly where each shot takes place.',
    inputLabel: 'Your Script',
    placeholder: 'EXT. COFFEE SHOP - MORNING\n\nSARAH, 28, sits alone at a corner table, laptop open. The morning rush fills the café with noise.\n\nSARAH\n(typing intently)\nThis has to work...\n\nINT. COFFEE SHOP - CONTINUOUS\n\nThe BARISTA slides a coffee toward her.',
    maxLength: 10000,
  },
  novel2video: {
    label: 'Novel2Video',
    accentColor: '#0d9488',
    acceptsReferenceVideo: true,
    referenceVideoLabel: 'Reference Footage',
    referenceVideoHint: 'Upload a video that matches the tone or setting of your story. Helps the AI generate visuals consistent with your narrative. MP4, MOV, or WebM up to 500 MB. Optional.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 3h8l4 4v10H4V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    steps: [
      'Paste your novel or story text below, or upload a .txt / .md / .pdf file',
      'The AI reads the full text and identifies key scenes, characters, and plot arcs',
      'It automatically compresses long narratives into cinematic video segments',
      'Hit Next to let the AI adapt your story into a complete video',
    ],
    tip: 'Works best with narratives that have clear scene transitions and vivid descriptions.',
    inputLabel: 'Your Novel / Story',
    placeholder: 'Paste your novel text here, or upload a .txt, .md, or .pdf file below...',
    maxLength: 50000,
  },
  cameo: {
    label: 'AutoCameo',
    accentColor: '#0ea5e9',
    acceptsReferenceVideo: true,
    referenceVideoLabel: 'Reference Video',
    referenceVideoHint: 'Upload a short video to set the scene context — location, movement style, or cinematography. MP4, MOV, or WebM up to 500 MB. Optional.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    steps: [
      'Upload a clear photo of the person or subject you want to appear in the video',
      'Describe the scene — where they are, what they\'re doing, and the overall mood',
      'Use the "Enhance with AI" button to expand a short idea into a full description',
      'Hit Next and AI will place your subject into a cinematic video sequence',
    ],
    tip: 'Use a well-lit, front-facing photo with a simple background for the best results.',
    inputLabel: 'Scene Description',
    placeholder: 'Describe the scene where the photo subject should appear...\n\nExample: "A professional walking through a modern city, presenting a product to a business meeting."',
    maxLength: 2000,
  },
};

const PIPELINE_OPTIONS = [
  { value: 'idea2video', label: 'Idea2Video', desc: 'Start from a concept' },
  { value: 'script2video', label: 'Script2Video', desc: 'Use a script' },
  { value: 'novel2video', label: 'Novel2Video', desc: 'Adapt written work' },
  { value: 'cameo', label: 'AutoCameo', desc: 'Star in a video' },
];

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

export default function ContentStep({ formData, onUpdate, onEnhance, isEnhancing, onError }) {
  const { pipeline, idea, script, requirement } = formData;
  const fileInputRef = useRef(null);
  const photoFileRef = useRef(null);
  const videoFileRef = useRef(null);
  const info = PIPELINE_INFO[pipeline] || PIPELINE_INFO.idea2video;

  const handleVideoFile = (file) => {
    if (!file) return;
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      onError && onError('Only MP4, MOV, WebM, and AVI video files are allowed.');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      onError && onError('Reference video must be under 500 MB.');
      return;
    }
    onUpdate({ referenceVideoFile: file });
  };
  const mainText = pipeline === 'idea2video' || pipeline === 'cameo' ? idea : script;
  const setMainText = (val) => {
    if (pipeline === 'idea2video' || pipeline === 'cameo') {
      onUpdate({ idea: val });
    } else {
      onUpdate({ script: val });
    }
  };

  return (
    <div className="content-step animate-fade-in-up">
      <div className="content-step-header">
        <h2 className="content-step-title">What's your content?</h2>
        <p className="content-step-desc">Choose your pipeline and provide your content below.</p>
      </div>

      <div className="pipeline-selector">
        {PIPELINE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`pipeline-option ${pipeline === opt.value ? 'active' : ''}`}
            onClick={() => onUpdate({ pipeline: opt.value, referenceVideoFile: null })}
          >
            <div className="pipeline-option-icon">
              {PIPELINE_INFO[opt.value].icon}
            </div>
            <div className="pipeline-option-text">
              <span className="pipeline-option-label">{opt.label}</span>
              <span className="pipeline-option-desc">{opt.desc}</span>
            </div>
            {pipeline === opt.value && (
              <svg className="pipeline-option-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#2563eb" />
                <path d="M4.5 8L6.5 10L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <div className="content-info-banner" style={{ '--info-accent': info.accentColor }}>
        <div className="content-info-icon">{info.icon}</div>
        <div className="content-info-body">
          <span className="content-info-how-label">How to use {info.label}</span>
          <ol className="content-info-steps">
            {info.steps.map((step, i) => (
              <li key={i} className="content-info-step">{step}</li>
            ))}
          </ol>
          {info.tip && (
            <p className="content-info-tip">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 5v3M6 3.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {info.tip}
            </p>
          )}
        </div>
      </div>

      <div className="content-form-group">
        <div className="content-label-row">
          <label className="content-label">{info.inputLabel}</label>
          <span className="content-char-count">
            {mainText.length} / {info.maxLength.toLocaleString()}
          </span>
        </div>
        <textarea
          className="content-textarea"
          value={mainText}
          onChange={(e) => setMainText(e.target.value)}
          placeholder={info.placeholder}
          maxLength={info.maxLength}
          rows={pipeline === 'script2video' || pipeline === 'novel2video' ? 10 : 6}
        />
        <button
          className={`enhance-btn${isEnhancing ? ' enhancing' : ''}`}
          onClick={() => onEnhance && onEnhance(mainText)}
          disabled={isEnhancing || mainText.trim().length < 10}
        >
          {isEnhancing ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="enhance-spinner">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="20 14" strokeLinecap="round" />
              </svg>
              Enhancing...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3.05 3.05l1.41 1.41M9.54 9.54l1.41 1.41M3.05 10.95l1.41-1.41M9.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Enhance with AI
            </>
          )}
        </button>
      </div>

      {(pipeline === 'script2video' || pipeline === 'novel2video') && (
        <div className="content-file-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            className="content-file-input-hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) onUpdate({ scriptFile: file });
            }}
          />
          <button
            className="content-file-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {formData.scriptFile ? formData.scriptFile.name : 'Upload file instead (.txt, .md, .pdf)'}
          </button>
          {formData.scriptFile && (
            <button
              className="content-file-remove"
              onClick={() => onUpdate({ scriptFile: null })}
            >Remove</button>
          )}
        </div>
      )}

      {pipeline === 'cameo' && (
        <div className="content-file-upload">
          <input
            ref={photoFileRef}
            type="file"
            accept="image/*"
            className="content-file-input-hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
                onError && onError('Only JPG, PNG, and WebP images are allowed.');
                e.target.value = '';
                return;
              }
              if (file.size > MAX_PHOTO_SIZE) {
                onError && onError('Photo must be under 10MB.');
                e.target.value = '';
                return;
              }
              onUpdate({ photoFile: file });
            }}
          />
          <div
            className={`content-photo-upload ${formData.photoFile ? 'has-file' : ''}`}
            onClick={() => photoFileRef.current?.click()}
          >
            {formData.photoFile ? (
              <div className="content-photo-preview">
                <img src={URL.createObjectURL(formData.photoFile)} alt="Preview" />
                <div className="content-photo-preview-info">
                  <span>{formData.photoFile.name}</span>
                  <button
                    className="content-file-remove"
                    onClick={(e) => { e.stopPropagation(); onUpdate({ photoFile: null }); }}
                  >Remove</button>
                </div>
              </div>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="24" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>Upload your photo</span>
                <span className="content-photo-hint">JPG, PNG, WebP up to 10MB</span>
              </>
            )}
          </div>
        </div>
      )}

      {info.acceptsReferenceVideo && (
        <div className="content-form-group">
          <div className="content-label-row">
            <label className="content-label">
              {info.referenceVideoLabel}
              <span className="content-optional"> (optional)</span>
            </label>
            {formData.referenceVideoFile && (
              <button
                className="content-file-remove"
                onClick={() => { onUpdate({ referenceVideoFile: null }); if (videoFileRef.current) videoFileRef.current.value = ''; }}
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={videoFileRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
            className="content-file-input-hidden"
            onChange={(e) => { handleVideoFile(e.target.files[0]); }}
          />
          <div
            className={`content-video-upload-zone ${formData.referenceVideoFile ? 'has-file' : ''}`}
            onClick={() => !formData.referenceVideoFile && videoFileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleVideoFile(e.dataTransfer.files[0]); }}
          >
            {formData.referenceVideoFile ? (
              <div className="content-video-file-info">
                <div className="content-video-file-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 7.5l5 2.5-5 2.5V7.5Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="content-video-file-meta">
                  <span className="content-video-file-name">{formData.referenceVideoFile.name}</span>
                  <span className="content-video-file-size">
                    {(formData.referenceVideoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              </div>
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="content-video-upload-icon">
                  <rect x="2" y="5" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M11 10l7 4-7 4V10Z" fill="currentColor" opacity="0.35" />
                  <path d="M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="content-video-upload-label">Drop a video file here or click to browse</span>
                <span className="content-photo-hint">{info.referenceVideoHint}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="content-form-group">
        <label className="content-label">Additional Requirements <span className="content-optional">(optional)</span></label>
        <input
          type="text"
          className="content-input"
          value={requirement}
          onChange={(e) => onUpdate({ requirement: e.target.value })}
          placeholder="e.g., Keep it under 2 minutes, target audience is teenagers, no violence"
          maxLength={300}
        />
      </div>
    </div>
  );
}
