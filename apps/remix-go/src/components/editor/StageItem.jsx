import React from 'react';
import { observer } from 'mobx-react-lite';

const TEXT_TOOLTIP = {
  Video: 'Click to change Video',
  Audio: 'Click to change Audio',
  Captions: 'Click to edit Captions',
};

const StageItem = ({ className, image, title, onClick, validationMessage }) => {
  return (
    <div
      title={validationMessage || ''}
      className={`${className || ''} ${validationMessage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
      onClick={() => {
        if (!validationMessage) {
          onClick();
        }
      }}
    >
      <div className="tooltip" data-tip={TEXT_TOOLTIP[title]}>
        {image}
        <br />
        <span className="text-sm">{title}</span>
      </div>
    </div>
  );
};

StageItem.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  image: PropTypes.element.isRequired,
  validationMessage: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default observer(StageItem);
