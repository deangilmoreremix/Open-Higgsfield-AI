import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreProvider';

import StageItem from './StageItem';

import MediaTypeDetector from '../../../lib/popcorn/util/mediaTypeDetector';
import StateManager from '../../../lib/editor/editorStateManager';

const EDITOR_STAGE_VIEWS = [{
  stage: StateManager.STAGE_TYPES.VIDEO_CUSTOMISE,
  image: <img src="/images/editor/video.svg" alt="Video" className="w-8 h-8" />,
  validator: () => null,
  title: 'Video',
}, {
  stage: StateManager.STAGE_TYPES.AUDIO_CUSTOMISE,
  image: <img src="/images/editor/audio.svg" alt="Audio" className="w-8 h-8" />,
  validator: (project) => {
    if (project && ['HTML5', 'Adaptive'].indexOf(new MediaTypeDetector().checkUrl(project.video)) === -1) {
      return 'Audio track customisation is available only for HTML5 videos.';
    }
    return null;
  },
  title: 'Audio',
}, {
  stage: StateManager.STAGE_TYPES.CAPTION_CUSTOMISE,
  image: <img src="/images/editor/caption.svg" alt="Captions" className="w-8 h-8" />,
  validator: () => null,
  title: 'Captions',
}];

const EditorStageChanger = ({ className, stage: currentStage, onChange }) => {
  const store = useStore();
  
  return (
    <div className={`flex gap-4 ${className || ''}`}>
      {EDITOR_STAGE_VIEWS.map(({ stage, image, title, validator }, idx) => (
        <StageItem
          key={idx}
          className={`stage-item ${stage === currentStage ? 'active border-b-2 border-blue-500' : ''}`}
          title={title}
          image={image}
          validationMessage={validator(store.activeProject)}
          onClick={() => onChange(stage)}
        />
      ))}
    </div>
  );
};

export default observer(EditorStageChanger);
