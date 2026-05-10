import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores/StoreProvider';

import ConstructionScene from './construction/ConstructionScene';
import CheckpointsList from './construction/CheckpointsList';

const ConstructionWorkspace = ({ className, checkForm }) => {
  const store = useStore();
  const { activeProject, currentUser } = store;
  const [popcorn, setPopcorn] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    return () => {
      if (activeProject) {
        activeProject.engines.forEach(engine => activeProject.detach(engine));
      }
    };
  }, []);

  const onPopcornInitialize = (wrapper) => {
    activeProject.engines = [];
    const popcornInstance = activeProject.popcornify(wrapper);
    popcornInstance.main = true;
    popcornInstance.currentUser = currentUser;
    activeProject.attach(popcornInstance, wrapper.parentNode.id);
    setPopcorn(popcornInstance);
    
    popcornInstance.on('elementSelected', (event) => {
      const { element } = event;
      activeProject.activeElement = element;
    });
    
    popcornInstance.on('elementUpdated', (event) => {
      const { element, options } = event;
      activeProject.update(element, options);
      checkForm();
    });
    
    popcornInstance.seek(activeProject.checkpoints[0]);
    activeProject.currentCheckpoint = activeProject.checkpoints[0];
  };

  const onProjectSeek = (at) => {
    if (popcorn) {
      popcorn.seek(at);
      activeProject.currentCheckpoint = at;
    }
  };

  const resignActiveElement = () => {
    activeProject.activeElement = null;
    if (popcorn) {
      popcorn.emit('elementSelected', { element: null });
    }
  };

  if (!activeProject) {
    return null;
  }

  return (
    <div 
      className={`w-full h-full ${className || ''}`}
      onClick={() => resignActiveElement()}
    >
      <ConstructionScene
        onPopcornInitialize={onPopcornInitialize}
      />
      <CheckpointsList
        className="mt-4"
        checkpoints={activeProject.checkpoints}
        onCheckpointSelect={onProjectSeek}
      />
    </div>
  );
};

export default observer(ConstructionWorkspace);
