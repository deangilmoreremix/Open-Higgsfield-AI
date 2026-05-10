import React from 'react';

const NicheScriptItem = ({ script, onUse }) => {
  const { title } = script;
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="font-medium text-gray-900">{title}</div>
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        onClick={() => onUse(script)}
      >
        Use
      </button>
    </div>
  );
};

NicheScriptItem.propTypes = {
  script: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  onUse: PropTypes.func.isRequired,
};

export default NicheScriptItem;
