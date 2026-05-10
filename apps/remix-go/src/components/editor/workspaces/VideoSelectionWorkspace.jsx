import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores/StoreProvider';

import InfiniteScroll from 'react-infinite-scroll-component';
import Search from '../../Search';
import InputField from './gridItems/InputField';
import VideoGridItem from './gridItems/VideoGridItem';
import StockMediaGridItem from './gridItems/StockMediaGridItem';

const VideoSelectionWorkspace = ({ className, inWindow = false, onVideoSelected }) => {
  const store = useStore();
  const { api } = store;
  
  // Define scopes including stock videos
  const SCOPES = {
    LIBRARY: 'library',
    UPLOADS: 'uploads',
    STOCK: 'stock'
  };

  const [scope, setScope] = useState(SCOPES.LIBRARY);
  const [libraryData, setLibraryData] = useState({ hasMore: true, elements: [], query: '' });
  const [uploadsData, setUploadsData] = useState({ hasMore: true, elements: [], query: '' });
  const [stockData, setStockData] = useState({ hasMore: false, elements: [], query: '', page: 1 });

  const currentData = scope === SCOPES.LIBRARY ? libraryData : scope === SCOPES.UPLOADS ? uploadsData : stockData;
  const setCurrentData = scope === SCOPES.LIBRARY ? setLibraryData : scope === SCOPES.UPLOADS ? setUploadsData : setStockData;
  const editable = scope === SCOPES.UPLOADS;

  const onPreview = (title, url) => {
    const videoPopup = (
      <video className="w-full max-w-4xl" preload autoPlay controls>
        <source src={url} />
      </video>
    );
    // Use a modal or popup component here
    console.log('Preview:', title, url);
  };

  const onRename = (item) => async (name) => {
    return api.renameAsset(item, name);
  };

  const onSearch = async (query) => {
    if (scope === SCOPES.STOCK) {
      // Search Pexels for stock videos
      setStockData({ hasMore: false, elements: [], query, page: 1 });
      try {
        const result = await api.searchStockMedia(query, 'video', { page: 1, perPage: 20 });
        setStockData({
          elements: result.videos || [],
          hasMore: result.nextPage !== null,
          query,
          page: 2,
        });
      } catch (error) {
        console.error('Stock video search failed:', error);
        setStockData({ hasMore: false, elements: [], query, page: 1 });
      }
    } else {
      // Search local library/uploads
      setCurrentData({ hasMore: true, elements: [], query });
      const newElements = await api.assets(scope, api.constructor.ASSET_TYPES.VIDEOS, 0, query);
      setCurrentData({
        elements: newElements,
        hasMore: newElements.length > 0,
        query,
      });
    }
  };

  const onScopeChange = async (newScope) => {
    if (newScope !== scope) {
      setScope(newScope);
      if (newScope === SCOPES.STOCK) {
        setStockData({ hasMore: false, elements: [], query: '', page: 1 });
      } else {
        setCurrentData({ hasMore: true, elements: [], query: '' });
      }
    }
  };

  // Stock media handlers
  const onStockPreview = (item) => {
    const videoPopup = (
      <video className="w-full max-w-4xl" preload autoPlay controls>
        <source src={item.files?.[0]?.link || item.image} />
      </video>
    );
    console.log('Stock video preview:', item);
  };

  const onStockDownload = async (item) => {
    try {
      const { user } = store;
      await api.downloadStockMedia(item, user?.id);
      // Could show success message here
    } catch (error) {
      console.error('Stock media download failed:', error);
      // Could show error message here
    }
  };

  const onStockUse = (item) => {
    // Use the highest quality video file available
    const videoFile = item.files?.find(f => f.quality === 'hd') ||
                     item.files?.find(f => f.quality === 'sd') ||
                     item.files?.[0];

    if (videoFile) {
      onVideoSelected(videoFile.link, item);
    }
  };

  const loadMore = async () => {
    if (scope === SCOPES.STOCK) {
      // Load more stock videos
      const { elements, query, page } = stockData;
      try {
        const result = await api.searchStockMedia(query, 'video', { page, perPage: 20 });
        setStockData({
          elements: [...elements, ...(result.videos || [])],
          hasMore: result.nextPage !== null,
          query,
          page: page + 1,
        });
      } catch (error) {
        console.error('Load more stock videos failed:', error);
        setStockData(prev => ({ ...prev, hasMore: false }));
      }
    } else {
      // Load more library/uploads videos
      const { elements, query } = currentData;
      const newElements = await api.assets(
        scope, api.constructor.ASSET_TYPES.VIDEOS, elements.length, query
      );
      setCurrentData({
        query,
        elements: [...elements, ...newElements],
        hasMore: newElements.length > 0,
      });
    }
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
          className={`px-4 py-2 rounded ${scope === SCOPES.LIBRARY ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => onScopeChange(SCOPES.LIBRARY)}
        >
          Library
        </button>
        <button
          className={`px-4 py-2 rounded ${scope === SCOPES.UPLOADS ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => onScopeChange(SCOPES.UPLOADS)}
        >
          Uploads
        </button>
        <button
          className={`px-4 py-2 rounded ${scope === SCOPES.STOCK ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => onScopeChange(SCOPES.STOCK)}
        >
          Stock Videos
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
            {scope === SCOPES.STOCK ? (
              <StockMediaGridItem
                item={item}
                onPreview={onStockPreview}
                onDownload={onStockDownload}
                onUse={onStockUse}
              />
            ) : (
              <>
                <VideoGridItem
                  item={item}
                  onPreview={onPreview}
                  onUse={onVideoSelected}
                />
                {editable && (
                  <InputField
                    value={item.title}
                    onSave={onRename(item)}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default observer(VideoSelectionWorkspace);
