/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { getAllTemplates } from '../supabase';
import './TemplateLibrary.css';

const CATEGORIES = ['All', 'Business', 'Social Media', 'Story', 'Education', 'Personal Brand', 'Entertainment'];

export default function TemplateLibrary({ onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllTemplates()
      .then(setTemplates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = templates.filter((t) => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const PIPELINE_LABELS = {
    idea2video: 'Idea → Video',
    script2video: 'Script → Video',
    novel2video: 'Novel → Video',
    cameo: 'Photo Cameo',
  };

  return (
    <div className="template-library animate-fade-in-up">
      <div className="template-library-header">
        <div>
          <h2 className="template-library-title">Video Templates</h2>
          <p className="template-library-subtitle">Start with a proven template to create your video faster.</p>
        </div>

        <div className="template-search-wrapper">
          <svg className="template-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="template-search"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="template-category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`template-category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="template-loading">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="template-skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="template-empty">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M16 18l8 4-8 4V18Z" fill="currentColor" opacity="0.4" />
          </svg>
          <p>No templates found</p>
          <span>Try a different category or search term</span>
        </div>
      ) : (
        <div className="template-grid">
          {filtered.map((template) => (
            <div key={template.id} className="template-card">
              <div className="template-card-thumb">
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="template-card-overlay">
                  <button
                    className="template-use-btn"
                    onClick={() => onSelect(template)}
                  >
                    Use Template
                  </button>
                </div>
                {template.is_featured && (
                  <div className="template-featured-badge">Featured</div>
                )}
              </div>
              <div className="template-card-body">
                <div className="template-card-meta">
                  <span className="template-pipeline-tag">{PIPELINE_LABELS[template.pipeline_type] || template.pipeline_type}</span>
                  <span className="template-style-tag">{template.style}</span>
                </div>
                <h3 className="template-card-name">{template.name}</h3>
                <p className="template-card-desc">{template.description}</p>
                {template.tags && template.tags.length > 0 && (
                  <div className="template-tags">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="template-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
