import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreProvider';

import InfiniteScroll from 'react-infinite-scroll-component';
import Search from '../Search';
import TemplateItem from './TemplateItem';
import EmbeddedPlayback from '../EmbeddedPlayback';

const Templates = ({ onTemplateSelected }) => {
  const store = useStore();
  const { api } = store;
  
  const [elements, setElements] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState('');
  const [currentPlayback, setCurrentPlayback] = useState(null);

  const onPreview = (template) => {
    setCurrentPlayback(
      <EmbeddedPlayback
        source={template.url}
        title={template.title}
        width="840"
        height="480"
      />
    );
    // Open modal with currentPlayback
    console.log('Preview template:', template.title);
  };

  const onSearch = async (searchQuery) => {
    setElements([]);
    const newElements = await api.templates(0, searchQuery);
    setElements(newElements);
    setHasMore(newElements.length > 0);
    setQuery(searchQuery);
  };

  const loadMore = async () => {
    const newElements = await api.templates(elements.length, query);
    setElements([...elements, ...newElements]);
    setHasMore(newElements.length > 0);
  };

  return (
    <div>
      <Search
        onSearch={onSearch}
        placeholder="Search through your templates..."
      />

      <InfiniteScroll
        dataLength={elements.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="text-center p-4">Loading...</div>}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4"
      >
        {elements.map((item, idx) => (
          <TemplateItem
            key={idx}
            template={item}
            onPreview={onPreview}
            onUse={(template) => onTemplateSelected(template)}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default observer(Templates);
