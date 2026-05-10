import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreProvider';

import InfiniteScroll from 'react-infinite-scroll-component';
import Search from '../Search';

import NicheScriptItem from './NicheScriptItem';

const NicheScriptsWorkspace = ({ onScriptSelected, className, useWaiter = false }) => {
  const [elements, setElements] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState('');
  const [waiter, setWaiter] = useState(null);
  
  const store = useStore();
  const { api } = store;

  const onUse = async (item) => {
    setWaiter({ message: 'Loading niche script...' });
    await onScriptSelected(item);
    setWaiter(null);
  };

  const onSearch = async (searchQuery) => {
    setElements([]);
    const newElements = await api.nicheScripts(0, searchQuery);
    setElements(newElements);
    setHasMore(newElements.length > 0);
    setQuery(searchQuery);
  };

  const loadMore = async () => {
    const newElements = await api.nicheScripts(elements.length, query);
    setElements([...elements, ...newElements]);
    setHasMore(newElements.length > 0);
  };

  return (
    <div>
      {waiter && useWaiter && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">{waiter.message}</span>
        </div>
      )}
      <Search onSearch={onSearch} />
      <div className={className || ''}>
        <InfiniteScroll
          dataLength={elements.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<div className="text-center p-4">Loading...</div>}
          className="divide-y divide-gray-200"
        >
          {elements.map((item, idx) => (
            <NicheScriptItem
              key={idx}
              script={item}
              onUse={onUse}
            />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default observer(NicheScriptsWorkspace);
