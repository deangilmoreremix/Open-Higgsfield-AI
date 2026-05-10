import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores/StoreProvider';

import InfiniteScroll from 'react-infinite-scroll-component';
import Search from '../../Search';

import CTAItem from './CTAItem';

const CallToActions = ({ className, onCtaSelected }) => {
  const [elements, setElements] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState('');
  const [waiter, setWaiter] = useState(null);
  
  const store = useStore();
  const { api } = store;

  const onSearch = async (searchQuery) => {
    setElements([]);
    const newElements = await api.cta(0, searchQuery);
    setElements(newElements);
    setHasMore(newElements.length > 0);
    setQuery(searchQuery);
  };

  const loadMore = async () => {
    const newElements = await api.cta(elements.length, query);
    setElements([...elements, ...newElements]);
    setHasMore(newElements.length > 0);
  };

  const handleCtaSelected = async (cta) => {
    setWaiter({ message: 'Loading CTA...' });
    await onCtaSelected(cta);
    setWaiter(null);
  };

  return (
    <div className={className || ''}>
      {waiter && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">{waiter.message}</span>
        </div>
      )}
      <Search onSearch={onSearch} />
      <InfiniteScroll
        dataLength={elements.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="text-center p-4">Loading...</div>}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4"
      >
        {elements.map((item, idx) => (
          <CTAItem
            key={idx}
            cta={item}
            onUse={handleCtaSelected}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default observer(CallToActions);
