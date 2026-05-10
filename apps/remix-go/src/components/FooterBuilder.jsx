import React, { useState, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import {
  LayoutGrid, Layout, Minus, AlignLeft, AlignCenter, Type, Link,
  MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram,
  Youtube, Github, RefreshCw, Edit3, Eye, Plus, Trash2, ArrowUp,
  ArrowDown, FileText, MessageSquare
} from 'lucide-react';

const footerLayouts = [
  { id: 'single-column', name: 'Single Column', icon: 'fa-square' },
  { id: 'multi-column', name: 'Multi Column', icon: 'fa-th' },
  { id: 'minimal', name: 'Minimal', icon: 'fa-minus' }
];

const footerStyles = [
  { id: 'standard', name: 'Standard', icon: 'fa-align-left' },
  { id: 'centered', name: 'Centered', icon: 'fa-align-center' },
  { id: 'minimal', name: 'Minimal', icon: 'fa-minus' }
];

const sectionTypes = [
  { id: 'links', name: 'Link List', icon: 'fa-link' },
  { id: 'contact', name: 'Contact Info', icon: 'fa-address-card' },
  { id: 'social', name: 'Social Media', icon: 'fa-share-alt' },
  { id: 'text', name: 'Text Block', icon: 'fa-font' },
  { id: 'newsletter', name: 'Newsletter', icon: 'fa-envelope' }
];

const socialPlatforms = [
  { id: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877f2' },
  { id: 'twitter', name: 'Twitter', icon: 'fa-twitter', color: '#1da1f2' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0077b5' },
  { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#e4405f' },
  { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#ff0000' },
  { id: 'github', name: 'GitHub', icon: 'fa-github', color: '#333333' }
];

const iconMap = {
  'fa-square': LayoutGrid,
  'fa-th': Layout,
  'fa-minus': Minus,
  'fa-align-left': AlignLeft,
  'fa-align-center': AlignCenter,
  'fa-link': Link,
  'fa-address-card': MapPin,
  'fa-share-alt': MessageSquare,
  'fa-font': Type,
  'fa-envelope': Mail,
  'fa-facebook': Facebook,
  'fa-twitter': Twitter,
  'fa-linkedin': Linkedin,
  'fa-instagram': Instagram,
  'fa-youtube': Youtube,
  'fa-github': Github,
  'fa-refresh': RefreshCw,
  'fa-edit': Edit3,
  'fa-eye': Eye,
  'fa-plus': Plus,
  'fa-trash': Trash2,
  'fa-arrow-up': ArrowUp,
  'fa-arrow-down': ArrowDown,
  'fa-file-text': FileText,
  'fa-map-marker': MapPin,
  'fa-phone': Phone,
  'fa-envelope': Mail
};

function FooterBuilder({ onFooterApply }) {
  const [footerConfig, setFooterConfig] = useState({
    layout: 'multi-column',
    style: 'standard',
    theme: 'dark',
    backgroundColor: '#212529',
    textColor: '#ffffff',
    linkColor: '#ffffff',
    borderColor: '#495057',
    sections: [
      {
        id: 'links',
        title: 'Quick Links',
        type: 'links',
        content: [
          { label: 'Home', url: '/' },
          { label: 'About', url: '/about' },
          { label: 'Services', url: '/services' },
          { label: 'Contact', url: '/contact' }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        type: 'links',
        content: [
          { label: 'Web Design', url: '/services/web-design' },
          { label: 'Development', url: '/services/development' },
          { label: 'Consulting', url: '/services/consulting' },
          { label: 'Support', url: '/services/support' }
        ]
      },
      {
        id: 'contact',
        title: 'Contact Info',
        type: 'contact',
        content: {
          address: '123 Business St, City, State 12345',
          phone: '+1 (555) 123-4567',
          email: 'hello@company.com'
        }
      },
      {
        id: 'social',
        title: 'Follow Us',
        type: 'social',
        content: [
          { platform: 'facebook', url: 'https://facebook.com/company', icon: 'fa-facebook' },
          { platform: 'twitter', url: 'https://twitter.com/company', icon: 'fa-twitter' },
          { platform: 'linkedin', url: 'https://linkedin.com/company', icon: 'fa-linkedin' },
          { platform: 'instagram', url: 'https://instagram.com/company', icon: 'fa-instagram' }
        ]
      }
    ],
    bottomBar: {
      copyright: '© 2024 Company Name. All rights reserved.',
      links: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms of Service', url: '/terms' },
        { label: 'Cookie Policy', url: '/cookies' }
      ]
    },
    styling: {
      padding: '60px 20px 20px 20px',
      margin: '40px 0 0 0',
      borderRadius: '0',
      fontSize: '14px',
      lineHeight: '1.6'
    }
  });

  const [activeTab, setActiveTab] = useState('layout');
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(-1);
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  const updateFooterConfig = useCallback((path, value) => {
    setFooterConfig(prev => {
      const keys = path.split('.');
      if (keys.length === 1) return { ...prev, [path]: value };

      const newConfig = { ...prev };
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  }, []);

  const selectSection = useCallback((index) => {
    setSelectedSectionIndex(index);
  }, []);

  const addSection = useCallback((type = 'links') => {
    const newSection = {
      id: `section_${Date.now()}`,
      title: `New ${type} Section`,
      type,
      content: getDefaultContent(type)
    };
    setFooterConfig(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setSelectedSectionIndex(footerConfig.sections.length);
  }, [footerConfig.sections.length]);

  const removeSection = useCallback((index) => {
    setFooterConfig(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
    setSelectedSectionIndex(prev => {
      if (prev === index) return -1;
      if (prev > index) return prev - 1;
      return prev;
    });
  }, []);

  const moveSection = useCallback((fromIndex, toIndex) => {
    setFooterConfig(prev => {
      const newSections = [...prev.sections];
      const [section] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, section);
      return { ...prev, sections: newSections };
    });
    setSelectedSectionIndex(toIndex);
  }, []);

  const updateSection = useCallback((index, property, value) => {
    setFooterConfig(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [property]: value } : section
      )
    }));
  }, []);

  const updateSectionContent = useCallback((sectionIndex, contentPath, value) => {
    setFooterConfig(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i !== sectionIndex) return section;
        if (contentPath.includes('.')) {
          const [parent, child] = contentPath.split('.');
          return {
            ...section,
            content: { ...section.content, [parent]: { ...section.content[parent], [child]: value } }
          };
        }
        return { ...section, content: { ...section.content, [contentPath]: value } };
      })
    }));
  }, []);

  const getDefaultContent = (type) => {
    switch (type) {
      case 'links': return [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }];
      case 'contact': return { address: '123 Business St, City, State 12345', phone: '+1 (555) 123-4567', email: 'hello@company.com' };
      case 'social': return [{ platform: 'facebook', url: '#', icon: 'fa-facebook' }];
      case 'text': return 'Your custom text content goes here.';
      case 'newsletter': return { title: 'Subscribe to our newsletter', placeholder: 'Enter your email', buttonText: 'Subscribe' };
      default: return {};
    }
  };

  const togglePreview = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

  const applyFooter = useCallback(() => {
    onFooterApply?.(footerConfig);
  }, [footerConfig, onFooterApply]);

  const resetToDefault = useCallback(() => {
    setFooterConfig({
      layout: 'multi-column',
      style: 'standard',
      theme: 'dark',
      backgroundColor: '#212529',
      textColor: '#ffffff',
      linkColor: '#ffffff',
      borderColor: '#495057',
      sections: [
        {
          id: 'links',
          title: 'Quick Links',
          type: 'links',
          content: [
            { label: 'Home', url: '/' },
            { label: 'About', url: '/about' },
            { label: 'Services', url: '/services' },
            { label: 'Contact', url: '/contact' }
          ]
        },
        {
          id: 'services',
          title: 'Services',
          type: 'links',
          content: [
            { label: 'Web Design', url: '/services/web-design' },
            { label: 'Development', url: '/services/development' },
            { label: 'Consulting', url: '/services/consulting' },
            { label: 'Support', url: '/services/support' }
          ]
        },
        {
          id: 'contact',
          title: 'Contact Info',
          type: 'contact',
          content: {
            address: '123 Business St, City, State 12345',
            phone: '+1 (555) 123-4567',
            email: 'hello@company.com'
          }
        },
        {
          id: 'social',
          title: 'Follow Us',
          type: 'social',
          content: [
            { platform: 'facebook', url: 'https://facebook.com/company', icon: 'fa-facebook' },
            { platform: 'twitter', url: 'https://twitter.com/company', icon: 'fa-twitter' },
            { platform: 'linkedin', url: 'https://linkedin.com/company', icon: 'fa-linkedin' },
            { platform: 'instagram', url: 'https://instagram.com/company', icon: 'fa-instagram' }
          ]
        }
      ],
      bottomBar: {
        copyright: '© 2024 Company Name. All rights reserved.',
        links: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Service', url: '/terms' },
          { label: 'Cookie Policy', url: '/cookies' }
        ]
      },
      styling: {
        padding: '60px 20px 20px 20px',
        margin: '40px 0 0 0',
        borderRadius: '0',
        fontSize: '14px',
        lineHeight: '1.6'
      }
    });
    setSelectedSectionIndex(-1);
  }, []);

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={18} /> : null;
  };

  const renderSection = (section) => {
    const { title, type, content } = section;

    return (
      <div className={`footer-section section-${type}`}>
        {title && (
          <h4 style={{ color: footerConfig.textColor, margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
            {title}
          </h4>
        )}
        {renderSectionContent(type, content)}
      </div>
    );
  };

  const renderSectionContent = (type, content) => {
    const linkStyle = { color: footerConfig.linkColor, textDecoration: 'none', display: 'block', marginBottom: '8px' };

    switch (type) {
      case 'links':
        return (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {content.map((link, index) => (
              <li key={index}>
                <a href={link.url} style={linkStyle}>{link.label}</a>
              </li>
            ))}
          </ul>
        );
      case 'contact':
        return (
          <div className="contact-info">
            {content.address && (
              <div style={{ marginBottom: '8px', color: footerConfig.textColor }}>
                <MapPin size={14} style={{ marginRight: '8px' }} />
                {content.address}
              </div>
            )}
            {content.phone && (
              <div style={{ marginBottom: '8px', color: footerConfig.textColor }}>
                <Phone size={14} style={{ marginRight: '8px' }} />
                <a href={`tel:${content.phone}`} style={linkStyle}>{content.phone}</a>
              </div>
            )}
            {content.email && (
              <div style={{ color: footerConfig.textColor }}>
                <Mail size={14} style={{ marginRight: '8px' }} />
                <a href={`mailto:${content.email}`} style={linkStyle}>{content.email}</a>
              </div>
            )}
          </div>
        );
      case 'social':
        return (
          <div className="social-links flex gap-3">
            {content.map((social, index) => (
              <a
                key={index}
                href={social.url}
                style={{ color: footerConfig.linkColor, textDecoration: 'none', fontSize: '18px' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getIcon(social.icon)}
              </a>
            ))}
          </div>
        );
      case 'text':
        return <div style={{ color: footerConfig.textColor }}>{content}</div>;
      case 'newsletter':
        return (
          <div>
            {content.title && <p style={{ margin: '0 0 12px 0', color: footerConfig.textColor }}>{content.title}</p>}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={content.placeholder}
                style={{ flex: 1, padding: '8px 12px', border: `1px solid ${footerConfig.borderColor}`, borderRadius: '4px', backgroundColor: 'transparent', color: footerConfig.textColor }}
              />
              <button style={{ padding: '8px 16px', backgroundColor: footerConfig.linkColor, color: footerConfig.backgroundColor, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {content.buttonText}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-5 bg-white border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-semibold m-0">Footer Builder</h2>
        <div className="flex gap-2">
          <button onClick={togglePreview} className="px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
            {isPreviewMode ? <><Edit3 size={16} /> Edit</> : <><Eye size={16} /> Preview</>}
          </button>
          <button onClick={resetToDefault} className="px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} /> Reset
          </button>
          <button onClick={applyFooter} className="px-4 py-2 bg-blue-500 text-white border border-blue-500 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-600 transition-colors">
            <Plus size={16} /> Add Footer
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
          {['layout', 'content', 'styling'].map(tab => (
            <button
              key={tab}
              className={clsx(
                'p-4 border-none bg-none text-left cursor-pointer text-sm font-medium text-gray-600 border-b border-gray-100 flex items-center gap-2 transition-all',
                activeTab === tab && 'bg-blue-500 text-white border-b-blue-500',
                activeTab !== tab && 'hover:bg-gray-50 hover:text-gray-700'
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'layout' && <Layout size={16} />}
              {tab === 'content' && <Edit3 size={16} />}
              {tab === 'styling' && <Type size={16} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-5">
          {activeTab === 'layout' && (
            <div>
              <div className="mb-4">
                <label className="block mb-2 text-xs font-medium text-gray-700 uppercase">Layout Type</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {footerLayouts.map(layout => (
                    <div
                      key={layout.id}
                      className={clsx(
                        'p-4 border-2 border-gray-200 rounded-lg cursor-pointer text-center transition-all hover:border-blue-500 hover:bg-gray-50',
                        footerConfig.layout === layout.id && 'border-blue-500 bg-blue-50'
                      )}
                      onClick={() => updateFooterConfig('layout', layout.id)}
                    >
                      <div className="text-2xl text-gray-600 mb-2">{getIcon(layout.icon)}</div>
                      <p className="m-0 text-sm font-medium">{layout.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-xs font-medium text-gray-700 uppercase">Footer Style</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {footerStyles.map(style => (
                    <div
                      key={style.id}
                      className={clsx(
                        'p-4 border-2 border-gray-200 rounded-lg cursor-pointer text-center transition-all hover:border-blue-500 hover:bg-gray-50',
                        footerConfig.style === style.id && 'border-blue-500 bg-blue-50'
                      )}
                      onClick={() => updateFooterConfig('style', style.id)}
                    >
                      <div className="text-2xl text-gray-600 mb-2">{getIcon(style.icon)}</div>
                      <p className="m-0 text-sm font-medium">{style.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-medium text-gray-700 uppercase">Theme</label>
                <select
                  value={footerConfig.theme}
                  onChange={(e) => updateFooterConfig('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-base font-semibold m-0">Footer Sections</h4>
                  <button onClick={() => addSection()} className="px-3 py-1.5 bg-blue-500 text-white border-none rounded text-sm hover:bg-blue-600">
                    <Plus size={14} /> Add Section
                  </button>
                </div>
                <div className="space-y-2 mb-4">
                  {footerConfig.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={clsx(
                        'flex items-center p-3 border border-gray-200 rounded-lg bg-white cursor-pointer transition-all',
                        selectedSectionIndex === index && 'border-blue-500 bg-gray-50'
                      )}
                      onClick={() => selectSection(index)}
                    >
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3">
                        {getIcon(sectionTypes.find(t => t.id === section.type)?.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-0.5">{section.title}</div>
                        <div className="text-xs text-gray-600">{section.type}</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 border-none bg-none text-gray-600 cursor-pointer rounded hover:bg-gray-200"
                          onClick={(e) => { e.stopPropagation(); moveSection(index, Math.max(0, index - 1)); }}
                          disabled={index === 0}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          className="p-1.5 border-none bg-none text-gray-600 cursor-pointer rounded hover:bg-gray-200"
                          onClick={(e) => { e.stopPropagation(); moveSection(index, Math.min(footerConfig.sections.length - 1, index + 1)); }}
                          disabled={index === footerConfig.sections.length - 1}
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          className="p-1.5 border-none bg-none text-gray-600 cursor-pointer rounded hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => { e.stopPropagation(); removeSection(index); }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSectionIndex >= 0 && (
                <SectionEditor
                  section={footerConfig.sections[selectedSectionIndex]}
                  sectionIndex={selectedSectionIndex}
                  onUpdateSection={updateSection}
                  onUpdateContent={updateSectionContent}
                  sectionTypes={sectionTypes}
                  socialPlatforms={socialPlatforms}
                  addSection={addSection}
                />
              )}

              <div>
                <h4 className="text-base font-semibold m-0 mb-3">Bottom Bar</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Copyright Text</label>
                    <input
                      type="text"
                      value={footerConfig.bottomBar.copyright}
                      onChange={(e) => updateFooterConfig('bottomBar.copyright', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-xs font-medium text-gray-700 uppercase">Legal Links</label>
                    <div className="space-y-2">
                      {footerConfig.bottomBar.links.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Link label"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...footerConfig.bottomBar.links];
                              newLinks[index].label = e.target.value;
                              updateFooterConfig('bottomBar.links', newLinks);
                            }}
                          />
                          <input
                            type="url"
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Link URL"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...footerConfig.bottomBar.links];
                              newLinks[index].url = e.target.value;
                              updateFooterConfig('bottomBar.links', newLinks);
                            }}
                          />
                          <button
                            className="px-2 py-1.5 bg-red-500 text-white border-none rounded text-xs hover:bg-red-600"
                            onClick={() => {
                              const newLinks = footerConfig.bottomBar.links.filter((_, i) => i !== index);
                              updateFooterConfig('bottomBar.links', newLinks);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        className="px-3 py-1.5 bg-blue-500 text-white border-none rounded text-sm hover:bg-blue-600"
                        onClick={() => {
                          const newLinks = [...footerConfig.bottomBar.links, { label: 'New Link', url: '#' }];
                          updateFooterConfig('bottomBar.links', newLinks);
                        }}
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'styling' && (
            <div className="space-y-4">
              {[
                { label: 'Background Color', path: 'backgroundColor', type: 'color' },
                { label: 'Text Color', path: 'textColor', type: 'color' },
                { label: 'Link Color', path: 'linkColor', type: 'color' },
                { label: 'Border Color', path: 'borderColor', type: 'color' },
                { label: 'Padding', path: 'styling.padding', type: 'text' },
                { label: 'Margin', path: 'styling.margin', type: 'text' },
                { label: 'Border Radius', path: 'styling.borderRadius', type: 'text' },
                { label: 'Font Size', path: 'styling.fontSize', type: 'text' },
                { label: 'Line Height', path: 'styling.lineHeight', type: 'text' }
              ].map(({ label, path, type }) => (
                <div key={path}>
                  <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">{label}</label>
                  {type === 'color' ? (
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={path.split('.').reduce((obj, key) => obj?.[key], footerConfig) || '#000000'}
                        onChange={(e) => updateFooterConfig(path, e.target.value)}
                        className="w-12 h-10 border-2 border-gray-200 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={path.split('.').reduce((obj, key) => obj?.[key], footerConfig) || ''}
                        onChange={(e) => updateFooterConfig(path, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={path.split('.').reduce((obj, key) => obj?.[key], footerConfig) || ''}
                      onChange={(e) => updateFooterConfig(path, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 bg-gray-50 overflow-y-auto p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold m-0">Live Preview</h3>
            <div className="text-xs text-gray-600">Footer preview with responsive design</div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            <footer
              style={{
                backgroundColor: footerConfig.backgroundColor,
                color: footerConfig.textColor,
                padding: footerConfig.styling.padding,
                margin: footerConfig.styling.margin,
                borderRadius: footerConfig.styling.borderRadius,
                fontSize: footerConfig.styling.fontSize,
                lineHeight: footerConfig.styling.lineHeight,
                borderTop: footerConfig.theme !== 'transparent' ? `1px solid ${footerConfig.borderColor}` : 'none'
              }}
            >
              <div className="px-5">
                {footerConfig.layout === 'single-column' ? (
                  <div>
                    {footerConfig.sections.map(section => (
                      <div key={section.id} className="mb-6">{renderSection(section)}</div>
                    ))}
                  </div>
                ) : footerConfig.layout === 'multi-column' ? (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
                    {footerConfig.sections.map(section => (
                      <div key={section.id}>{renderSection(section)}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    {footerConfig.sections[0] && renderSection(footerConfig.sections[0])}
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: `1px solid ${footerConfig.borderColor}`,
                  padding: '20px 0',
                  margin: '20px 0 0 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div className="text-xs opacity-80">{footerConfig.bottomBar.copyright}</div>
                <div className="flex gap-4">
                  {footerConfig.bottomBar.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      style={{ color: footerConfig.linkColor, textDecoration: 'none', marginLeft: index > 0 ? '20px' : '0' }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, sectionIndex, onUpdateSection, onUpdateContent, sectionTypes, socialPlatforms, addSection }) {
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={14} /> : null;
  };

  if (!section) return null;

  return (
    <div className="mt-4">
      <h4 className="text-base font-semibold m-0 mb-3">Edit Section</h4>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Section Title</label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdateSection(sectionIndex, 'title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Section Type</label>
          <select
            value={section.type}
            onChange={(e) => {
              const newType = e.target.value;
              onUpdateSection(sectionIndex, 'type', newType);
              onUpdateSection(sectionIndex, 'content', (() => {
                switch (newType) {
                  case 'links': return [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }];
                  case 'contact': return { address: '123 Business St', phone: '+1 (555) 123-4567', email: 'hello@company.com' };
                  case 'social': return [{ platform: 'facebook', url: '#', icon: 'fa-facebook' }];
                  case 'text': return 'Your custom text content goes here.';
                  case 'newsletter': return { title: 'Subscribe', placeholder: 'Enter email', buttonText: 'Subscribe' };
                  default: return {};
                }
              })());
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          >
            {sectionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {section.type === 'links' && (
          <div>
            <label className="block mb-2 text-xs font-medium text-gray-700 uppercase">Links</label>
            <div className="space-y-2">
              {section.content.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Link label"
                    value={link.label}
                    onChange={(e) => {
                      const newContent = [...section.content];
                      newContent[index].label = e.target.value;
                      onUpdateSection(sectionIndex, 'content', newContent);
                    }}
                  />
                  <input
                    type="url"
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Link URL"
                    value={link.url}
                    onChange={(e) => {
                      const newContent = [...section.content];
                      newContent[index].url = e.target.value;
                      onUpdateSection(sectionIndex, 'content', newContent);
                    }}
                  />
                  <button
                    className="px-2 py-1.5 bg-red-500 text-white border-none rounded text-xs hover:bg-red-600"
                    onClick={() => {
                      const newContent = section.content.filter((_, i) => i !== index);
                      onUpdateSection(sectionIndex, 'content', newContent);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="px-3 py-1.5 bg-blue-500 text-white border-none rounded text-sm hover:bg-blue-600"
                onClick={() => {
                  const newContent = [...section.content, { label: 'New Link', url: '#' }];
                  onUpdateSection(sectionIndex, 'content', newContent);
                }}
              >
                Add Link
              </button>
            </div>
          </div>
        )}

        {section.type === 'contact' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Address</label>
              <textarea
                value={section.content.address}
                onChange={(e) => onUpdateContent(sectionIndex, 'address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-vertical"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Phone</label>
              <input
                type="tel"
                value={section.content.phone}
                onChange={(e) => onUpdateContent(sectionIndex, 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Email</label>
              <input
                type="email"
                value={section.content.email}
                onChange={(e) => onUpdateContent(sectionIndex, 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        )}

        {section.type === 'social' && (
          <div>
            <label className="block mb-2 text-xs font-medium text-gray-700 uppercase">Social Links</label>
            <div className="space-y-2">
              {section.content.map((social, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    className="w-32 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    value={social.platform}
                    onChange={(e) => {
                      const newContent = [...section.content];
                      newContent[index].platform = e.target.value;
                      newContent[index].icon = socialPlatforms.find(p => p.id === e.target.value)?.icon || 'fa-link';
                      onUpdateSection(sectionIndex, 'content', newContent);
                    }}
                  >
                    {socialPlatforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input
                    type="url"
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Profile URL"
                    value={social.url}
                    onChange={(e) => {
                      const newContent = [...section.content];
                      newContent[index].url = e.target.value;
                      onUpdateSection(sectionIndex, 'content', newContent);
                    }}
                  />
                  <button
                    className="px-2 py-1.5 bg-red-500 text-white border-none rounded text-xs hover:bg-red-600"
                    onClick={() => {
                      const newContent = section.content.filter((_, i) => i !== index);
                      onUpdateSection(sectionIndex, 'content', newContent);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="px-3 py-1.5 bg-blue-500 text-white border-none rounded text-sm hover:bg-blue-600"
                onClick={() => {
                  const newContent = [...section.content, { platform: 'facebook', url: '#', icon: 'fa-facebook' }];
                  onUpdateSection(sectionIndex, 'content', newContent);
                }}
              >
                Add Social Link
              </button>
            </div>
          </div>
        )}

        {section.type === 'text' && (
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Content</label>
            <textarea
              value={section.content}
              onChange={(e) => onUpdateSection(sectionIndex, 'content', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-vertical"
            />
          </div>
        )}

        {section.type === 'newsletter' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Title</label>
              <input
                type="text"
                value={section.content.title}
                onChange={(e) => onUpdateContent(sectionIndex, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Placeholder</label>
              <input
                type="text"
                value={section.content.placeholder}
                onChange={(e) => onUpdateContent(sectionIndex, 'placeholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Button Text</label>
              <input
                type="text"
                value={section.content.buttonText}
                onChange={(e) => onUpdateContent(sectionIndex, 'buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default observer(FooterBuilder);
