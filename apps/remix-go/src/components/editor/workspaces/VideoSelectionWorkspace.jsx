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
  
  // Define scopes including AI content
  const SCOPES = {
    LIBRARY: 'library',
    UPLOADS: 'uploads',
    STOCK: 'stock',
    AI_IMAGES: 'ai_images',
    AI_VIDEOS: 'ai_videos'
  };

  const [scope, setScope] = useState(SCOPES.LIBRARY);
  const [libraryData, setLibraryData] = useState({ hasMore: true, elements: [], query: '' });
  const [uploadsData, setUploadsData] = useState({ hasMore: true, elements: [], query: '' });
  const [stockData, setStockData] = useState({ hasMore: false, elements: [], query: '', page: 1 });
  const [aiImagesData, setAiImagesData] = useState({ elements: [], query: '', generating: false });
  const [aiVideosData, setAiVideosData] = useState({ elements: [], query: '', generating: false });

  const getCurrentData = () => {
    switch (scope) {
      case SCOPES.LIBRARY: return libraryData;
      case SCOPES.UPLOADS: return uploadsData;
      case SCOPES.STOCK: return stockData;
      case SCOPES.AI_IMAGES: return aiImagesData;
      case SCOPES.AI_VIDEOS: return aiVideosData;
      default: return libraryData;
    }
  };

  const currentData = getCurrentData();
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
    } else if (scope === SCOPES.AI_IMAGES) {
      // Generate AI images
      setAiImagesData({ elements: [], query, generating: true });
      try {
        const result = await api.generateAIImages(query);
        setAiImagesData({
          elements: result.images || [],
          query,
          generating: false,
        });
      } catch (error) {
        console.error('AI image generation failed:', error);
        setAiImagesData({ elements: [], query, generating: false });
      }
    } else if (scope === SCOPES.AI_VIDEOS) {
      // Generate AI videos
      setAiVideosData({ elements: [], query, generating: true });
      try {
        const result = await api.generateAIVideos(query);
        setAiVideosData({
          elements: result.videos || [],
          query,
          generating: false,
        });
      } catch (error) {
        console.error('AI video generation failed:', error);
        setAiVideosData({ elements: [], query, generating: false });
      }
    } else {
      // Search local library/uploads
      const setCurrentData = scope === SCOPES.LIBRARY ? setLibraryData : setUploadsData;
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
      } else if (newScope === SCOPES.AI_IMAGES) {
        setAiImagesData({ elements: [], query: '', generating: false });
      } else if (newScope === SCOPES.AI_VIDEOS) {
        setAiVideosData({ elements: [], query: '', generating: false });
      } else {
        const setCurrentData = newScope === SCOPES.LIBRARY ? setLibraryData : setUploadsData;
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

  // AI content handlers
  const onAiImagePreview = (item) => {
    const imagePopup = (
      <img src={item.url || item.src?.large} alt={item.prompt || 'AI Generated'} className="max-w-4xl max-h-96 object-contain" />
    );
    console.log('AI image preview:', item);
  };

  const onAiVideoPreview = (item) => {
    const videoPopup = (
      <video className="w-full max-w-4xl" preload autoPlay controls>
        <source src={item.url || item.video_url} />
      </video>
    );
    console.log('AI video preview:', item);
  };

  const onAiImageDownload = async (item) => {
    try {
      const { user } = store;
      await api.saveAIGeneratedContent(item, user?.id, 'image');
    } catch (error) {
      console.error('AI image download failed:', error);
    }
  };

  const onAiVideoDownload = async (item) => {
    try {
      const { user } = store;
      await api.saveAIGeneratedContent(item, user?.id, 'video');
    } catch (error) {
      console.error('AI video download failed:', error);
    }
  };

  const onAiImageUse = (item) => {
    // For images, we'll pass the image URL directly
    onVideoSelected(item.url || item.src?.large, item);
  };

  const onAiVideoUse = (item) => {
    onVideoSelected(item.url || item.video_url, item);
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
    } else if (scope === SCOPES.AI_IMAGES || scope === SCOPES.AI_VIDEOS) {
      // AI content doesn't support infinite scroll - generate new content instead
      // Could implement "Generate More" functionality here
    } else {
      // Load more library/uploads videos
      const setCurrentData = scope === SCOPES.LIBRARY ? setLibraryData : setUploadsData;
      const { elements, query } = scope === SCOPES.LIBRARY ? libraryData : uploadsData;
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
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
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
        <button
          className={`px-4 py-2 rounded ${scope === SCOPES.AI_IMAGES ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          onClick={() => onScopeChange(SCOPES.AI_IMAGES)}
        >
          AI Images
        </button>
        <button
          className={`px-4 py-2 rounded ${scope === SCOPES.AI_VIDEOS ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          onClick={() => onScopeChange(SCOPES.AI_VIDEOS)}
        >
          AI Videos
        </button>
      </div>
      <Search onSearch={onSearch} />

      {scope === SCOPES.AI_IMAGES || scope === SCOPES.AI_VIDEOS ? (
        // AI content uses simple grid without infinite scroll
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      ) : (
        <InfiniteScroll
          dataLength={currentData.elements.length}
          next={loadMore}
          hasMore={currentData.hasMore}
          loader={<div className="text-center p-4">Loading...</div>}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4"
        >
      )}
        {scope === SCOPES.AI_IMAGES && aiImagesData.generating && (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Generating AI images...</p>
            </div>
          </div>
        )}

        {scope === SCOPES.AI_VIDEOS && aiVideosData.generating && (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Generating AI videos...</p>
            </div>
          </div>
        )}

        {currentData.elements.map((item, idx) => (
          <div key={idx} className="border rounded-lg overflow-hidden">
            {scope === SCOPES.STOCK ? (
              <StockMediaGridItem
                item={item}
                onPreview={onStockPreview}
                onDownload={onStockDownload}
                onUse={onStockUse}
              />
            ) : scope === SCOPES.AI_IMAGES ? (
              <StockMediaGridItem
                item={{ ...item, type: 'photo' }}
                onPreview={onAiImagePreview}
                onDownload={onAiImageDownload}
                onUse={onAiImageUse}
              />
            ) : scope === SCOPES.AI_VIDEOS ? (
              <StockMediaGridItem
                item={{ ...item, type: 'video' }}
                onPreview={onAiVideoPreview}
                onDownload={onAiVideoDownload}
                onUse={onAiVideoUse}
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

        {scope === SCOPES.AI_IMAGES && currentData.elements.length === 0 && !aiImagesData.generating && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>Enter a prompt above to generate AI images</p>
            <p className="text-sm mt-2">Examples: "a cat in space", "sunset over mountains", "cyberpunk city"</p>
          </div>
        )}

        {scope === SCOPES.AI_VIDEOS && currentData.elements.length === 0 && !aiVideosData.generating && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>Enter a prompt above to generate AI videos</p>
            <p className="text-sm mt-2">Examples: "a rocket launching", "ocean waves", "city traffic at night"</p>
          </div>
        )}

        {scope === SCOPES.AI_IMAGES || scope === SCOPES.AI_VIDEOS ? (
          </div>
        ) : (
          </InfiniteScroll>
        )}
    </div>
  );
};

export default observer(VideoSelectionWorkspace);
