import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreProvider';

import Waiter from '../Waiter';
import EditorStateManager from '../../lib/editor/editorStateManager';
import VideoSelectionWorkspace from './workspaces/VideoSelectionWorkspace';
import AudioSelectionWorkspace from './workspaces/AudioSelectionWorkspace';
import ConstructionWorkspace from './workspaces/ConstructionWorkspace';

const WorkspaceContainer = ({ className, checkForm, setWarning, warning }) => {
  const store = useStore();
  const { activeProject, editorStateManager } = store;
  const [waiter, setWaiter] = useState(null);
  
  const stage = editorStateManager.stage;

  const warningList = warning.additionalData && warning.additionalData.length > 0
    ? (
        <ul>
          {warning.additionalData.map((item, idx) => (
            <li key={idx} id={item}>{item}</li>
          ))}
        </ul>
      )
    : null;

  const handleVideoSelected = async (video) => {
    setWaiter({ message: 'Loading video...' });
    await activeProject.updateVideo(video);
    activeProject.version = Math.random();
    editorStateManager.stage = EditorStateManager.STAGE_TYPES.CAPTION_CUSTOMISE;
    setWaiter(null);
  };

  const handleAudioSelected = async (audio) => {
    setWaiter({ message: 'Loading audio...' });
    await activeProject.updateAudio(audio);
    activeProject.version = Math.random();
    editorStateManager.stage = EditorStateManager.STAGE_TYPES.CAPTION_CUSTOMISE;
    setWaiter(null);
  };

  return (
    <div className={className || ''}>
      {(warning.text || (warning.additionalData && warning.additionalData.length > 0)) && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p>{warning.text}</p>
          {warningList}
          <button 
            className="ml-auto"
            onClick={() => setWarning({})}
          >
            ✕
          </button>
        </div>
      )}
      
      {(() => {
        switch (stage) {
          case EditorStateManager.STAGE_TYPES.VIDEO_CUSTOMISE:
            return (
              <div className="overflow-y-auto h-full">
                {waiter && <Waiter message={waiter.message} />}
                <VideoSelectionWorkspace
                  inWindow
                  onVideoSelected={handleVideoSelected}
                />
              </div>
            );
          case EditorStateManager.STAGE_TYPES.AUDIO_CUSTOMISE:
            return (
              <div className="overflow-y-auto h-full">
                {waiter && <Waiter message={waiter.message} />}
                <AudioSelectionWorkspace
                  inWindow
                  onAudioSelected={handleAudioSelected}
                />
              </div>
            );
          case EditorStateManager.STAGE_TYPES.CAPTION_CUSTOMISE:
            return (
              <ConstructionWorkspace
                className="w-full h-full"
                checkForm={checkForm}
              />
            );
          default:
            return null;
        }
      })()}
    </div>
  );
};

export default observer(WorkspaceContainer);
