/* eslint-disable */
import React from 'react';
import './HistoryView.css';

const STATUS_ICONS = {
  completed: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="#10b981" />
      <path d="M3.5 7L5.5 9.5L10.5 4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  processing: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 1.5s linear infinite' }}>
      <circle cx="7" cy="7" r="5.5" stroke="#3b82f6" strokeWidth="2" strokeDasharray="18 14" />
    </svg>
  ),
  failed: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="#ef4444" />
      <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  pending: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#d1d5db" strokeWidth="1.5" />
      <path d="M7 4v3l2 2" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const PIPELINE_LABELS = {
  idea2video: 'Idea2Video',
  script2video: 'Script2Video',
  novel2video: 'Novel2Video',
  cameo: 'AutoCameo',
};

export default function HistoryView({ history, onReuse }) {
  if (!history || history.length === 0) {
    return (
      <div className="history-view animate-fade-in-up">
        <div className="history-header">
          <h2 className="history-title">History</h2>
          <p className="history-subtitle">Your past video generations will appear here.</p>
        </div>
        <div className="history-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M19 19l10 5-10 5V19Z" fill="currentColor" opacity="0.3" />
          </svg>
          <p>No videos yet</p>
          <span>Create your first video to see it here</span>
        </div>
      </div>
    );
  }

  return (
    <div className="history-view animate-fade-in-up">
      <div className="history-header">
        <div>
          <h2 className="history-title">History</h2>
          <p className="history-subtitle">{history.length} generation{history.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="history-list">
        {history.map((item, i) => (
          <div key={item.id || item.job_id || i} className="history-item">
            <div className="history-item-status">
              {STATUS_ICONS[item.status] || STATUS_ICONS.pending}
            </div>
            <div className="history-item-info">
              <div className="history-item-row">
                <span className="history-item-type">
                  {PIPELINE_LABELS[item.pipeline_type] || item.pipeline_type || 'Video'}
                </span>
                <span className="history-item-date">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : ''}
                </span>
              </div>
              <p className="history-item-idea">
                {item.idea || item.input_idea || item.script || item.input_script || '—'}
              </p>
              <div className="history-item-tags">
                {item.style && <span className="history-tag">{item.style}</span>}
                {item.quality && <span className="history-tag">{item.quality}</span>}
              </div>
            </div>
            <div className="history-item-actions">
              {item.status === 'completed' && (
                <a
                  href={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/job/${item.job_id || item.id}/download`}
                  className="history-download-btn"
                  target="_blank"
                  rel="noreferrer"
                  title="Download"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v6.5M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </a>
              )}
              {onReuse && (
                <button
                  className="history-reuse-btn"
                  onClick={() => onReuse(item)}
                  title="Use same settings"
                >
                  Reuse
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
