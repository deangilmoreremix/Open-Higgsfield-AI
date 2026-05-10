import { supabase } from './supabase';

/**
 * Pexels API Service for Remix-Go
 * Provides access to stock photos and videos for the video editor
 * API Docs: https://www.pexels.com/api/documentation/
 */

class PexelsService {
  constructor() {
    this.baseURL = 'https://api.pexels.com/v1';
    this.apiKey = import.meta.env.VITE_PEXELS_API_KEY || '';
  }

  getHeaders() {
    return {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  // Search stock photos
  async searchPhotos(query, options = {}) {
    const {
      page = 1,
      perPage = 20,
      orientation = null, // 'landscape', 'portrait', 'square'
    } = options;

    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (orientation) params.append('orientation', orientation);

    try {
      const response = await fetch(`${this.baseURL}/search/photos?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        photos: data.photos.map(this.formatPhoto),
        page: data.page,
        perPage: data.per_page,
        totalResults: data.total_results,
        nextPage: data.next_page,
      };
    } catch (error) {
      console.error('Pexels searchPhotos error:', error);
      throw error;
    }
  }

  // Search stock videos
  async searchVideos(query, options = {}) {
    const {
      page = 1,
      perPage = 20,
      orientation = null, // 'landscape', 'portrait', 'square'
    } = options;

    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (orientation) params.append('orientation', orientation);

    try {
      const response = await fetch(`${this.baseURL}/search/videos?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        videos: data.videos.map(this.formatVideo),
        page: data.page,
        perPage: data.per_page,
        totalResults: data.total_results,
        nextPage: data.next_page,
      };
    } catch (error) {
      console.error('Pexels searchVideos error:', error);
      throw error;
    }
  }

  // Get curated photos (editor's picks)
  async getCuratedPhotos(options = {}) {
    const {
      page = 1,
      perPage = 20,
    } = options;

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    try {
      const response = await fetch(`${this.baseURL}/curated/photos?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        photos: data.photos.map(this.formatPhoto),
        page: data.page,
        perPage: data.per_page,
        totalResults: data.total_results,
        nextPage: data.next_page,
      };
    } catch (error) {
      console.error('Pexels getCuratedPhotos error:', error);
      throw error;
    }
  }

  // Format photo data to consistent structure
  formatPhoto(photo) {
    return {
      id: photo.id,
      type: 'photo',
      width: photo.width,
      height: photo.height,
      url: photo.url,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      src: {
        original: photo.src.original,
        large: photo.src.large,
        medium: photo.src.medium,
        small: photo.src.small,
        portrait: photo.src.portrait,
        landscape: photo.src.landscape,
        tiny: photo.src.tiny,
      },
      alt: photo.alt || '',
      avgColor: photo.avg_color,
    };
  }

  // Format video data to consistent structure
  formatVideo(video) {
    return {
      id: video.id,
      type: 'video',
      width: video.width,
      height: video.height,
      duration: video.duration,
      url: video.url,
      image: video.image,
      files: video.video_files.map(f => ({
        id: f.id,
        quality: f.quality,
        fileType: f.file_type,
        width: f.width,
        height: f.height,
        fps: f.fps,
        link: f.link,
      })),
      user: {
        id: video.user?.id,
        name: video.user?.name,
        url: video.user?.url,
      },
    };
  }

  // Download and save to Supabase storage
  async downloadAndSave(asset, userId) {
    try {
      const response = await fetch(asset.src.large || asset.src.original);
      const blob = await response.blob();

      const fileName = `pexels-${asset.id}-${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`;
      const filePath = `${asset.type}s/${fileName}`;

      const { data, error } = await supabase.storage
        .from('remix-media')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('remix-media')
        .getPublicUrl(filePath);

      return {
        ...asset,
        supabasePath: filePath,
        supabaseUrl: publicUrl,
        savedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Pexels downloadAndSave error:', error);
      throw error;
    }
  }

  // Save to user's media library
  async saveToLibrary(asset, userId) {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          user_id: userId,
          source: 'pexels',
          source_id: asset.id.toString(),
          type: asset.type,
          url: asset.supabaseUrl || asset.src?.large || asset.src?.original,
          thumbnail: asset.src?.small || asset.image,
          width: asset.width,
          height: asset.height,
          duration: asset.duration || null,
          metadata: asset,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Pexels saveToLibrary error:', error);
      throw error;
    }
  }
}

export default new PexelsService();