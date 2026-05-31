// src/apps/videco/services/videcoService.js
import { supabase } from '../../../lib/supabase-client.ts';

export const videcoService = {
  async trackVideoView(videoId, metadata = {}) {
    try {
      const { error } = await supabase.from('videco_video_views').insert({
        video_id: videoId,
        viewed_at: new Date().toISOString(),
        ...metadata
      });
      if (error) throw error;
    } catch (err) {
      // Silent fail - analytics shouldn't break UX
      console.warn('Analytics tracking failed:', err);
    }
  },

  async getVideoStats(videoId) {
    try {
      const { count, error } = await supabase
        .from('videco_video_views')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId);
      
      if (error) throw error;
      return { views: count || 0 };
    } catch (err) {
      return { views: 0 };
    }
  },

  async saveGeneratedVideo(videoData) {
    try {
      const { data, error } = await supabase.from('videco_videos').insert({
        ...videoData,
        created_at: new Date().toISOString()
      }).select().single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      return null;
    }
  }
};