import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../../stores/StoreProvider';

import { videoResizer } from '../../../../lib/PopcornProxy';

const ConstructionScene = ({ onPopcornInitialize }) => {
  const embedWrapperRef = useRef(null);
  const popcornWrapperRef = useRef(null);

  useEffect(() => {
    if (onPopcornInitialize) {
      onPopcornInitialize(popcornWrapperRef.current);
      const updateSceneSize = videoResizer(embedWrapperRef.current);
      window.addEventListener('resize', handleResize);
      updateSceneSize();
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const handleResize = () => {
    if (embedWrapperRef.current) {
      const updateSceneSize = videoResizer(embedWrapperRef.current);
      updateSceneSize();
    }
  };

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full relative" ref={embedWrapperRef}>
        <div id="video-container-scene" className="w-full h-full">
          <div ref={popcornWrapperRef} />
        </div>
      </div>
    </div>
  );
};

export default observer(ConstructionScene);
