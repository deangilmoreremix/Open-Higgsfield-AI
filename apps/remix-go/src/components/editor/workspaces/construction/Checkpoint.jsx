import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../../stores/StoreProvider';

import { videoResizer } from '../../../../lib/PopcornProxy';

const Checkpoint = ({ at }) => {
  const store = useStore();
  const { activeProject } = store;
  const embedWrapperRef = useRef(null);
  const popcornWrapperRef = useRef(null);

  useEffect(() => {
    const popcorn = activeProject.attach(
      activeProject.popcornify(popcornWrapperRef.current), 
      `video-container-${at}`
    );
    const updateSceneSize = videoResizer(embedWrapperRef.current, 2);
    
    popcorn.seek(at);
    updateSceneSize();
    
    const handleResize = () => updateSceneSize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [at]);

  return (
    <div className={`thumbnail-container`}>
      <div className="w-full h-full relative" ref={embedWrapperRef}>
        <div id={`video-container-${at}`} className="w-full h-full">
          <div ref={popcornWrapperRef} />
        </div>
      </div>
    </div>
  );
};

export default observer(Checkpoint);
