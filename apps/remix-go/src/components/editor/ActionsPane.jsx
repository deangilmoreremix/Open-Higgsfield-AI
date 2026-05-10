import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreProvider';

const ActionsPane = ({ className, children }) => {
  return (
    <div className={`container mx-auto ${className || ''}`}>
      {children}
    </div>
  );
};

export default observer(ActionsPane);
