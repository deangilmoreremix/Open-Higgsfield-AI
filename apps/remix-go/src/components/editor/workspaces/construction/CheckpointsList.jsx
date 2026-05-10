import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../../stores/StoreProvider';

import Checkpoint from './Checkpoint';

const CheckpointsList = ({ className, checkpoints, onCheckpointSelect }) => {
  const store = useStore();
  
  return (
    <div className={`w-full ${className || ''}`}>
      <div className="flex overflow-x-auto gap-2 p-4">
        {checkpoints.map((item, idx) => (
          <div 
            key={idx} 
            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onCheckpointSelect(item)}
          >
            <Checkpoint at={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default observer(CheckpointsList);
