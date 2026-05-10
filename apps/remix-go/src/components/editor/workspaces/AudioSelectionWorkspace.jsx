import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores/StoreProvider';

import InfiniteScroll from 'react-infinite-scroll-component';
import Search from '../../Search';
import InputField from './gridItems/InputField';
import AudioGridItem from './gridItems/AudioGridItem';

const AudioSelectionWorkspace = ({ className, inWindow = false, onAudioSelected }) => {
  const store = useStore();
  const { api } = store;
  
  const [scope, setScope] = useState(api.constructor.ASSET_SCOPES.LIBRARY);
  const [libraryData, setLibraryData] = useState({ hasMore: true, elements: [], query: '' });
  const [uploadsData, setUploadsData] = useState({ hasMore: true, elements: [], query: '' });
  
  const currentData = scope === api.constructor.ASSET_SCOPES.LIBRARY ? libraryData : uploadsData;
  const setCurrentData = scope === api.constructor.ASSET_SCOPES.LIBRARY ? setLibraryData : setUploadsData;
  const editable = scope === api.constructor.ASSET_SCOPES.UPLOADS;

  const onSearch = async (query) => {
    setCurrentData({ hasMore: true, elements: [], query });
    await loadAudio({ elements: [], query });
  };

  const onScopeChange = async (newScope) => {
    if (newScope !== scope) {
      setScope(newScope);
      setCurrentData({ hasMore: true, elements: [], query: '' });
    }
  };

  const onRename = (item) => async (name) => {
    return api.renameAsset(item, name);
  };

  const loadAudio = async ({ elements, query }) => {
    const newElements = await api.assets(
      scope, api.constructor.ASSET_TYPES.AUDIOS, elements.length, query
    );
    setCurrentData({
      query,
      elements: [...elements, ...newElements],
      hasMore: newElements.length === api.perPage,
    });
  };

  const loadMore = async () => {
    const { elements, query } = currentData;
    await loadAudio({ elements, query });
  };

  const sizes = inWindow ?
    [
      { columns: 1, gutter: 20 },
      { mq: '694px', columns: 2, gutter: 20 },
      { mq: '1000px', columns: 3, gutter: 20 },
      { mq: '1536px', columns: 4, gutter: 20 },
    ] : [
      { columns: 1, gutter: 30 },
      { mq: '512px', columns: 2, gutter: 30 },
      { mq: '768px', columns: 3, gutter: 30 },
      { mq: '1024px', columns: 4, gutter: 30 },
      { mq: '1536px', columns: 5, gutter: 30 },
    ];

  return (
    <div>
      <div className="flex justify-center gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${scope === api.constructor.ASSET_SCOPES.LIBRARY ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => onScopeChange(api.constructor.ASSET_SCOPES.LIBRARY)}
        >
          Library
        </button>
        <button
          className={`px-4 py-2 rounded ${scope === api.constructor.ASSET_SCOPES.UPLOADS ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => onScopeChange(api.constructor.ASSET_SCOPES.UPLOADS)}
        >
          Uploads
        </button>
      </div>
      <Search onSearch={onSearch} />
      <InfiniteScroll
        dataLength={currentData.elements.length}
        next={loadMore}
        hasMore={currentData.hasMore}
        loader={<div className="text-center p-4">Loading...</div>}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4"
      >
        {currentData.elements.map((item, idx) => (
          <div key={idx} className="border rounded-lg overflow-hidden">
            <AudioGridItem
              item={item}
              onUse={onAudioSelected}
            />
            {editable && (
              <InputField
                value={item.title}
                onSave={onRename(item)}
              />
            )}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default observer(AudioSelectionWorkspace);
