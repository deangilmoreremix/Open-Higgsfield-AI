import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreProvider';
import { Check, ExternalLink, WindowMaximize, ArrowDown, Download, Phone, Mail, ChevronDown, ChevronUp, Eye, RefreshCw, Plus, Palette, MousePointer, BarChart3, Layers } from 'lucide-react';
import clsx from 'clsx';

const buttonStyles = [
  { id: 'primary', name: 'Primary', color: '#007bff' },
  { id: 'secondary', name: 'Secondary', color: '#6c757d' },
  { id: 'success', name: 'Success', color: '#28a745' },
  { id: 'danger', name: 'Danger', color: '#dc3545' },
  { id: 'warning', name: 'Warning', color: '#ffc107' },
  { id: 'info', name: 'Info', color: '#17a2b8' },
  { id: 'light', name: 'Light', color: '#f8f9fa' },
  { id: 'dark', name: 'Dark', color: '#343a40' },
  { id: 'outline', name: 'Outline', color: 'transparent' },
  { id: 'ghost', name: 'Ghost', color: 'transparent' },
  { id: 'gradient', name: 'Gradient', color: 'linear-gradient(45deg, #007bff, #6610f2)' }
];

const buttonSizes = [
  { id: 'small', name: 'Small', padding: '6px 12px', fontSize: '14px' },
  { id: 'medium', name: 'Medium', padding: '10px 20px', fontSize: '16px' },
  { id: 'large', name: 'Large', padding: '12px 24px', fontSize: '18px' },
  { id: 'extra-large', name: 'Extra Large', padding: '16px 32px', fontSize: '20px' }
];

const buttonShapes = [
  { id: 'square', name: 'Square', borderRadius: '0' },
  { id: 'rounded', name: 'Rounded', borderRadius: '4px' },
  { id: 'pill', name: 'Pill', borderRadius: '50px' },
  { id: 'circle', name: 'Circle', borderRadius: '50%' }
];

const hoverEffects = [
  { id: 'none', name: 'None' },
  { id: 'lift', name: 'Lift Up' },
  { id: 'glow', name: 'Glow' },
  { id: 'scale', name: 'Scale' },
  { id: 'slide', name: 'Slide' },
  { id: 'fill', name: 'Color Fill' },
  { id: 'bounce', name: 'Bounce' }
];

const animations = [
  { id: 'none', name: 'None' },
  { id: 'fade-in', name: 'Fade In' },
  { id: 'slide-up', name: 'Slide Up' },
  { id: 'slide-down', name: 'Slide Down' },
  { id: 'slide-left', name: 'Slide Left' },
  { id: 'slide-right', name: 'Slide Right' },
  { id: 'bounce', name: 'Bounce' },
  { id: 'pulse', name: 'Pulse' },
  { id: 'rotate', name: 'Rotate' },
  { id: 'flip', name: 'Flip' }
];

const actionTypes = [
  { id: 'link', name: 'Link', icon: ExternalLink },
  { id: 'modal', name: 'Open Modal', icon: WindowMaximize },
  { id: 'scroll', name: 'Scroll to Section', icon: ArrowDown },
  { id: 'download', name: 'Download File', icon: Download },
  { id: 'phone', name: 'Phone Call', icon: Phone },
  { id: 'email', name: 'Send Email', icon: Mail }
];

const shadows = [
  { id: 'none', name: 'None', value: 'none' },
  { id: 'small', name: 'Small', value: '0 2px 4px rgba(0,0,0,0.1)' },
  { id: 'medium', name: 'Medium', value: '0 4px 12px rgba(0,0,0,0.15)' },
  { id: 'large', name: 'Large', value: '0 8px 24px rgba(0,0,0,0.2)' },
  { id: 'inset', name: 'Inset', value: 'inset 0 2px 4px rgba(0,0,0,0.1)' }
];

const CTABuilder = observer(() => {
  const store = useStore();
  const [ctaConfig, setCtaConfig] = useState({
    type: 'button',
    style: 'primary',
    size: 'medium',
    shape: 'rounded',
    content: {
      text: 'Get Started Today',
      subtext: '',
      icon: '',
      iconPosition: 'left'
    },
    action: {
      type: 'link',
      target: '#',
      modalId: '',
      scrollTarget: '',
      downloadUrl: '',
      phoneNumber: '',
      emailAddress: '',
      emailSubject: ''
    },
    appearance: {
      backgroundColor: '#007bff',
      textColor: '#ffffff',
      borderColor: '#007bff',
      borderWidth: '2px',
      shadow: 'medium',
      hoverEffect: 'lift',
      animation: 'fade-in'
    },
    positioning: {
      alignment: 'center',
      margin: '16px 0',
      width: 'auto',
      customWidth: '200px'
    },
    conversion: {
      urgencyText: '',
      socialProof: '',
      guarantee: '',
      tracking: {
        eventName: 'cta_click',
        eventCategory: 'conversion',
        eventLabel: ''
      }
    }
  });

  const [activeTab, setActiveTab] = useState('content');
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [previewHover, setPreviewHover] = useState(false);

  const updateCTAConfig = (path, value) => {
    setCtaConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const buttonStyle = useMemo(() => {
    const { style, size, shape, appearance } = ctaConfig;
    const sizeConfig = buttonSizes.find(s => s.id === size);
    const shapeConfig = buttonShapes.find(s => s.id === shape);

    let baseStyle = {
      padding: sizeConfig.padding,
      fontSize: sizeConfig.fontSize,
      borderRadius: shapeConfig.borderRadius,
      border: `${appearance.borderWidth} solid ${appearance.borderColor}`,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    };

    switch (style) {
      case 'primary':
        baseStyle.backgroundColor = appearance.backgroundColor;
        baseStyle.color = appearance.textColor;
        break;
      case 'secondary':
        baseStyle.backgroundColor = '#6c757d';
        baseStyle.color = '#ffffff';
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.color = appearance.borderColor;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.color = appearance.textColor;
        baseStyle.border = 'none';
        break;
      case 'gradient':
        baseStyle.background = 'linear-gradient(45deg, #007bff, #6610f2)';
        baseStyle.color = '#ffffff';
        baseStyle.border = 'none';
        break;
      default:
        baseStyle.backgroundColor = appearance.backgroundColor;
        baseStyle.color = appearance.textColor;
    }

    if (previewHover) {
      switch (appearance.hoverEffect) {
        case 'lift':
          baseStyle.transform = 'translateY(-2px)';
          baseStyle.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
          break;
        case 'glow':
          baseStyle.boxShadow = `0 0 20px ${appearance.backgroundColor}50`;
          break;
        case 'scale':
          baseStyle.transform = 'scale(1.05)';
          break;
        case 'fill':
          if (style === 'outline') {
            baseStyle.backgroundColor = appearance.borderColor;
            baseStyle.color = '#ffffff';
          }
          break;
      }
    }

    return baseStyle;
  }, [ctaConfig, previewHover]);

  const containerStyle = useMemo(() => {
    const { positioning } = ctaConfig;
    return {
      textAlign: positioning.alignment,
      margin: positioning.margin,
      width: positioning.width === 'full' ? '100%' :
             positioning.width === 'custom' ? positioning.customWidth : 'auto'
    };
  }, [ctaConfig.positioning]);

  const renderPreview = () => {
    const { content, action, positioning } = ctaConfig;

    const buttonContent = (
      <>
        {content.icon && content.iconPosition === 'left' && (
          <Check size={16} />
        )}
        <span>{content.text}</span>
        {content.icon && content.iconPosition === 'right' && (
          <Check size={16} />
        )}
      </>
    );

    const buttonElement = action.type === 'link' ? (
      <a
        href={action.target}
        style={buttonStyle}
        onMouseEnter={() => setPreviewHover(true)}
        onMouseLeave={() => setPreviewHover(false)}
        target={action.target.startsWith('http') ? '_blank' : '_self'}
        rel={action.target.startsWith('http') ? 'noopener noreferrer' : ''}
      >
        {buttonContent}
      </a>
    ) : (
      <button
        style={buttonStyle}
        onMouseEnter={() => setPreviewHover(true)}
        onMouseLeave={() => setPreviewHover(false)}
        onClick={() => {
          switch (action.type) {
            case 'modal':
              break;
            case 'scroll':
              break;
            case 'download':
              break;
            case 'phone':
              window.location.href = `tel:${action.phoneNumber}`;
              break;
            case 'email':
              window.location.href = `mailto:${action.emailAddress}?subject=${encodeURIComponent(action.emailSubject)}`;
              break;
          }
        }}
      >
        {buttonContent}
      </button>
    );

    return (
      <div className="cta-preview-container" style={containerStyle}>
        <div className="cta-preview">
          {ctaConfig.conversion.urgencyText && (
            <div className="urgency-text">{ctaConfig.conversion.urgencyText}</div>
          )}

          {buttonElement}

          {ctaConfig.conversion.socialProof && (
            <div className="social-proof">{ctaConfig.conversion.socialProof}</div>
          )}

          {ctaConfig.conversion.guarantee && (
            <div className="guarantee">{ctaConfig.conversion.guarantee}</div>
          )}

          {content.subtext && (
            <div className="cta-subtext">{content.subtext}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-5 bg-white border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Call-to-Action Builder</h2>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
              onClick={togglePreview}
            >
              {isPreviewMode ? <Eye size={16} /> : <Layers size={16} />}
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
              onClick={() => setCtaConfig({
                type: 'button',
                style: 'primary',
                size: 'medium',
                shape: 'rounded',
                content: { text: 'Get Started Today', subtext: '', icon: '', iconPosition: 'left' },
                action: { type: 'link', target: '#', modalId: '', scrollTarget: '', downloadUrl: '', phoneNumber: '', emailAddress: '', emailSubject: '' },
                appearance: { backgroundColor: '#007bff', textColor: '#ffffff', borderColor: '#007bff', borderWidth: '2px', shadow: 'medium', hoverEffect: 'lift', animation: 'fade-in' },
                positioning: { alignment: 'center', margin: '16px 0', width: 'auto', customWidth: '200px' },
                conversion: { urgencyText: '', socialProof: '', guarantee: '', tracking: { eventName: 'cta_click', eventCategory: 'conversion', eventLabel: '' } }
              })}
            >
              <RefreshCw size={16} /> Reset
            </button>
            <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 text-sm">
              <Plus size={16} /> Add CTA
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tabs Sidebar */}
        <div className="w-52 bg-white border-r overflow-y-auto">
          {['content', 'style', 'action', 'conversion'].map(tab => {
            const icons = { content: Palette, style: Palette, action: MousePointer, conversion: BarChart3 };
            const Icon = icons[tab];
            return (
              <button
                key={tab}
                className={clsx(
                  'w-full p-4 text-left border-none bg-transparent cursor-pointer flex items-center gap-2 transition-all text-sm',
                  activeTab === tab ? 'bg-blue-500 text-white' : 'hover:bg-gray-50 text-gray-700'
                )}
                onClick={() => setActiveTab(tab)}
              >
                <Icon size={16} />
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Main Panel */}
        <div className="w-80 bg-white border-r overflow-y-auto p-5">
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Button Text</label>
                <input
                  type="text"
                  value={ctaConfig.content.text}
                  onChange={(e) => updateCTAConfig('content.text', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Subtext (Optional)</label>
                <input
                  type="text"
                  value={ctaConfig.content.subtext}
                  onChange={(e) => updateCTAConfig('content.subtext', e.target.value)}
                  placeholder="Additional text below button"
                  className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">Icon (Optional)</label>
                <div className="grid grid-cols-6 gap-2">
                  <div
                    className={clsx('p-2 border rounded cursor-pointer text-center', !ctaConfig.content.icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500')}
                    onClick={() => updateCTAConfig('content.icon', '')}
                  >
                    <span className="text-xs">None</span>
                  </div>
                  {['Check', 'ArrowRight', 'Download', 'Phone', 'Mail', 'Star', 'Heart', 'Lightbulb', 'Rocket', 'Users', 'ShoppingCart', 'Play', 'ExternalLink', 'Calendar', 'MapPin'].map(icon => (
                    <div
                      key={icon}
                      className={clsx('p-2 border rounded cursor-pointer text-center', ctaConfig.content.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500')}
                      onClick={() => updateCTAConfig('content.icon', icon)}
                    >
                      <span className="text-xs">{icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              {ctaConfig.content.icon && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Icon Position</label>
                  <select
                    value={ctaConfig.content.iconPosition}
                    onChange={(e) => updateCTAConfig('content.iconPosition', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-semibold mb-3">Button Style</h4>
                <div className="grid grid-cols-3 gap-3">
                  {buttonStyles.map(style => (
                    <div
                      key={style.id}
                      className={clsx('p-3 border-2 rounded-lg cursor-pointer text-center transition-all', ctaConfig.style === style.id ? 'border-blue-500' : 'border-gray-200 hover:border-blue-500')}
                      onClick={() => {
                        updateCTAConfig('style', style.id);
                        updateCTAConfig('appearance.backgroundColor', style.color.startsWith('linear') ? '#007bff' : style.color);
                        updateCTAConfig('appearance.borderColor', style.color.startsWith('linear') ? '#007bff' : style.color);
                      }}
                      style={{
                        backgroundColor: style.color.startsWith('linear') ? undefined : style.color,
                        background: style.color.startsWith('linear') ? style.color : undefined,
                        color: ['light', 'outline', 'ghost'].includes(style.id) ? '#212529' : '#ffffff'
                      }}
                    >
                      {style.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Size</label>
                  <select
                    value={ctaConfig.size}
                    onChange={(e) => updateCTAConfig('size', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    {buttonSizes.map(size => (
                      <option key={size.id} value={size.id}>{size.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Shape</label>
                  <select
                    value={ctaConfig.shape}
                    onChange={(e) => updateCTAConfig('shape', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    {buttonShapes.map(shape => (
                      <option key={shape.id} value={shape.id}>{shape.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Background</label>
                  <input
                    type="color"
                    value={ctaConfig.appearance.backgroundColor}
                    onChange={(e) => updateCTAConfig('appearance.backgroundColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Text</label>
                  <input
                    type="color"
                    value={ctaConfig.appearance.textColor}
                    onChange={(e) => updateCTAConfig('appearance.textColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Border</label>
                  <input
                    type="color"
                    value={ctaConfig.appearance.borderColor}
                    onChange={(e) => updateCTAConfig('appearance.borderColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Border Width</label>
                  <input
                    type="text"
                    value={ctaConfig.appearance.borderWidth}
                    onChange={(e) => updateCTAConfig('appearance.borderWidth', e.target.value)}
                    placeholder="2px"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold mb-3">Effects</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Shadow</label>
                    <select
                      value={ctaConfig.appearance.shadow}
                      onChange={(e) => updateCTAConfig('appearance.shadow', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      {shadows.map(shadow => (
                        <option key={shadow.id} value={shadow.id}>{shadow.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Hover Effect</label>
                    <select
                      value={ctaConfig.appearance.hoverEffect}
                      onChange={(e) => updateCTAConfig('appearance.hoverEffect', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      {hoverEffects.map(effect => (
                        <option key={effect.id} value={effect.id}>{effect.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Animation</label>
                  <select
                    value={ctaConfig.appearance.animation}
                    onChange={(e) => updateCTAConfig('appearance.animation', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    {animations.map(anim => (
                      <option key={anim.id} value={anim.id}>{anim.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold mb-3">Positioning</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Alignment</label>
                    <select
                      value={ctaConfig.positioning.alignment}
                      onChange={(e) => updateCTAConfig('positioning.alignment', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                      <option value="full-width">Full Width</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Width</label>
                    <select
                      value={ctaConfig.positioning.width}
                      onChange={(e) => updateCTAConfig('positioning.width', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="auto">Auto</option>
                      <option value="full">Full Width</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                {ctaConfig.positioning.width === 'custom' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Custom Width</label>
                    <input
                      type="text"
                      value={ctaConfig.positioning.customWidth}
                      onChange={(e) => updateCTAConfig('positioning.customWidth', e.target.value)}
                      placeholder="200px"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Margin</label>
                  <input
                    type="text"
                    value={ctaConfig.positioning.margin}
                    onChange={(e) => updateCTAConfig('positioning.margin', e.target.value)}
                    placeholder="16px 0"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'action' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">Action Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {actionTypes.map(actionType => {
                    const Icon = actionType.icon;
                    return (
                      <div
                        key={actionType.id}
                        className={clsx('p-3 border-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all', ctaConfig.action.type === actionType.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500')}
                        onClick={() => updateCTAConfig('action.type', actionType.id)}
                      >
                        <Icon size={16} />
                        <span className="text-sm">{actionType.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {ctaConfig.action.type === 'link' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">URL</label>
                  <input
                    type="url"
                    value={ctaConfig.action.target}
                    onChange={(e) => updateCTAConfig('action.target', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}

              {ctaConfig.action.type === 'modal' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Modal ID</label>
                  <input
                    type="text"
                    value={ctaConfig.action.modalId}
                    onChange={(e) => updateCTAConfig('action.modalId', e.target.value)}
                    placeholder="modal-1"
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}

              {ctaConfig.action.type === 'scroll' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Scroll Target</label>
                  <input
                    type="text"
                    value={ctaConfig.action.scrollTarget}
                    onChange={(e) => updateCTAConfig('action.scrollTarget', e.target.value)}
                    placeholder="#section-2"
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}

              {ctaConfig.action.type === 'download' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">File URL</label>
                  <input
                    type="url"
                    value={ctaConfig.action.downloadUrl}
                    onChange={(e) => updateCTAConfig('action.downloadUrl', e.target.value)}
                    placeholder="/files/document.pdf"
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}

              {ctaConfig.action.type === 'phone' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={ctaConfig.action.phoneNumber}
                    onChange={(e) => updateCTAConfig('action.phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}

              {ctaConfig.action.type === 'email' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      value={ctaConfig.action.emailAddress}
                      onChange={(e) => updateCTAConfig('action.emailAddress', e.target.value)}
                      placeholder="hello@example.com"
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Email Subject</label>
                    <input
                      type="text"
                      value={ctaConfig.action.emailSubject}
                      onChange={(e) => updateCTAConfig('action.emailSubject', e.target.value)}
                      placeholder="Let's work together"
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'conversion' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Urgency Text</label>
                <input
                  type="text"
                  value={ctaConfig.conversion.urgencyText}
                  onChange={(e) => updateCTAConfig('conversion.urgencyText', e.target.value)}
                  placeholder="Limited time offer!"
                  className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Social Proof</label>
                <input
                  type="text"
                  value={ctaConfig.conversion.socialProof}
                  onChange={(e) => updateCTAConfig('conversion.socialProof', e.target.value)}
                  placeholder="Join 10,000+ happy customers"
                  className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Guarantee</label>
                <input
                  type="text"
                  value={ctaConfig.conversion.guarantee}
                  onChange={(e) => updateCTAConfig('conversion.guarantee', e.target.value)}
                  placeholder="30-day money back guarantee"
                  className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Analytics Tracking</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Event Name</label>
                    <input
                      type="text"
                      value={ctaConfig.conversion.tracking.eventName}
                      onChange={(e) => updateCTAConfig('conversion.tracking.eventName', e.target.value)}
                      placeholder="cta_click"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Category</label>
                    <input
                      type="text"
                      value={ctaConfig.conversion.tracking.eventCategory}
                      onChange={(e) => updateCTAConfig('conversion.tracking.eventCategory', e.target.value)}
                      placeholder="conversion"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Label</label>
                  <input
                    type="text"
                    value={ctaConfig.conversion.tracking.eventLabel}
                    onChange={(e) => updateCTAConfig('conversion.tracking.eventLabel', e.target.value)}
                    placeholder="primary_cta"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-sm w-full max-w-2xl">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Hover to see effects</p>
            </div>
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CTABuilder;
