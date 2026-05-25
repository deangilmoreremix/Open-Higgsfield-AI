import React, { useState, useEffect } from 'react';
import { HeaderMegaMenu } from './HeaderMegaMenu.js';
import { SettingsModal } from './SettingsModal.js';

export function Header({ navigate }) {
  const [activeRoute, setActiveRoute] = useState('image');

  const tooltipDescriptions = {
    image: 'Image — Create and edit images with AI-powered tools',
    video: 'Video — Edit and produce video content with advanced timeline',
    cinema: 'Cinema — Professional video editing and cinematic effects',
    library: 'Library — Browse and manage your media assets',
    templates: 'Templates — Access pre-built project templates',
    explore: 'Explore — Discover new features and community content',
    assist: 'Assist — Get AI-powered help and suggestions'
  };

  const topLevelItems = [
    { label: 'Image', route: 'image' },
    { label: 'Video', route: 'video' },
    { label: 'Cinema', route: 'cinema' },
    { label: 'Library', route: 'library' },
    { label: 'Templates', route: 'templates' },
    { label: 'Explore', route: 'explore' },
    { label: 'Assist', route: 'assist' }
  ];

  const handleNavClick = (route) => {
    setActiveRoute(route);
    navigate(`/${route}`);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSettingsClick = () => {
    document.body.appendChild(SettingsModal());
  };

  useEffect(() => {
    const path = window.location.pathname.slice(1);
    if (path) setActiveRoute(path);
  }, []);

  return (
    <header className="w-full flex flex-col z-50 sticky top-0">
      <div className="w-full h-16 bg-black flex items-center justify-between px-4 md:px-6 border-b border-white/5 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-6">
          <div
            className="cursor-pointer hover:scale-110 transition-transform"
            data-tooltip="Home — Return to the main dashboard"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="black"/>
                <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <HeaderMegaMenu navigate={handleNavClick} currentPage={activeRoute} />

          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-bold text-secondary overflow-x-auto">
            {topLevelItems.map(item => (
              <a
                key={item.route}
                data-route={item.route}
                className={`hover:text-white transition-all cursor-pointer relative group ${
                  activeRoute === item.route ? 'text-white' : 'text-secondary'
                }`}
                onClick={() => handleNavClick(item.route)}
                data-tooltip={tooltipDescriptions[item.route] || `${item.label} — Navigate to ${item.label}`}
              >
                {item.label}
                <div
                  className="nav-dot absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  style={{ display: activeRoute === item.route ? 'block' : 'none' }}
                />
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-[13px] font-bold text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-colors"
            title="Settings — API key, local models, preferences"
            data-tooltip="Settings — Configure API keys, local models, and app preferences"
            onClick={handleSettingsClick}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}