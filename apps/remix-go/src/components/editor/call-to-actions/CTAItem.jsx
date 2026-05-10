import React from 'react';

const CTAItem = ({ cta, onUse }) => {
  const { thumbnail } = cta;
  return (
    <div className="relative rounded-lg overflow-hidden bg-cover bg-center h-48" style={{ backgroundImage: `url(${thumbnail})` }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => onUse(cta)}
        >
          Use
        </button>
      </div>
    </div>
  );
};

CTAItem.propTypes = {
  cta: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
  }),
  onUse: PropTypes.func.isRequired,
};

export default CTAItem;
