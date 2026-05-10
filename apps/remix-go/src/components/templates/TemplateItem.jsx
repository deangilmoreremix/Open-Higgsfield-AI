/**
 * TemplateItem component - Ported to modern React
 */
import React from 'react';

const TemplateItem = ({ template, onPreview, onUse }) => {
  const { thumbnail, title } = template;
  
  return (
    <div 
      className="relative rounded-lg overflow-hidden h-48 bg-cover bg-center cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundImage: `url(${thumbnail})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        <button
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
        >
          <span className="text-2xl">▶</span>
        </button>
        <p className="text-white text-sm">{title}</p>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onUse(template);
          }}
        >
          Use
        </button>
      </div>
    </div>
  );
};

TemplateItem.propTypes = {
  template: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
  }),
  onPreview: PropTypes.func.isRequired,
  onUse: PropTypes.func.isRequired,
};

export default TemplateItem;
