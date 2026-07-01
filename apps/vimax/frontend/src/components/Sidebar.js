/* eslint-disable */
import React from 'react';
import { useTheme } from '../ThemeContext';
import ThemeToggle from '../ThemeToggle';
import './Sidebar.css';

const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button className={`sidebar-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span className="sidebar-nav-icon">{icon}</span>
    <span className="sidebar-nav-label">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="sidebar-nav-badge">{badge}</span>
    )}
  </button>
);

export default function Sidebar({ activeView, onViewChange, userStats, historyCount, batchCount, onNewVideo }) {
  const { isDark } = useTheme();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#2563eb" />
              <path d="M8 9.5L19 14L8 18.5V9.5Z" fill="white" />
              <circle cx="21" cy="9" r="3" fill="#f97316" />
            </svg>
          </div>
          <span className="sidebar-logo-text">ViMax</span>
        </div>
        <ThemeToggle />
      </div>

      <button className="sidebar-new-video-btn" onClick={onNewVideo}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        New Video
      </button>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section-label">Create</div>
        <NavItem
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L2 7v9h5v-5h4v5h5V7L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          }
          label="Home"
          active={activeView === 'wizard'}
          onClick={() => onViewChange('wizard')}
        />
        <NavItem
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 7.5l4 1.5-4 1.5V7.5Z" fill="currentColor" />
            </svg>
          }
          label="Templates"
          active={activeView === 'templates'}
          onClick={() => onViewChange('templates')}
        />

        <div className="sidebar-nav-section-label">Library</div>
        <NavItem
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 4h12M3 8h9M3 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          label="History"
          active={activeView === 'history'}
          onClick={() => onViewChange('history')}
          badge={historyCount}
        />
        <NavItem
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5h12v10H3V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M6 5V3h6v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 9h4M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          label="Batches"
          active={activeView === 'batches'}
          onClick={() => onViewChange('batches')}
          badge={batchCount}
        />
      </nav>

      <div className="sidebar-stats">
        <div className="sidebar-stat">
          <span className="sidebar-stat-value">{userStats?.total_generations || 0}</span>
          <span className="sidebar-stat-label">Videos Created</span>
        </div>
        <div className="sidebar-stat-divider" />
        <div className="sidebar-stat">
          <span className="sidebar-stat-value">
            {userStats?.average_rating ? userStats.average_rating.toFixed(1) : '—'}
          </span>
          <span className="sidebar-stat-label">Avg Rating</span>
        </div>
      </div>
    </aside>
  );
}
