import { supabase, isSupabaseConfigured } from './supabase.js';

if (!isSupabaseConfigured()) {
  console.warn('[AssetLifecycleManager] Supabase not configured - using mock client');
}

class AssetLifecycleManager {
  constructor(bucket = 'generated-assets') {
    this.bucket = bucket;
    this.states = {
      UPLOADING: 'uploading',
      UPLOADED: 'uploaded',
      PROCESSING: 'processing',
      PROCESSED: 'processed',
      RENDERING: 'rendering',
      RENDERED: 'rendered',
      EXPORTING: 'exporting',
      EXPORTED: 'exported',
      ARCHIVED: 'archived',
      ERROR: 'error'
    };
  }

  async createAsset(metadata) {
    const { data, error } = await supabase
      .from('generated_assets')
      .insert({
        ...metadata,
        state: this.states.UPLOADING,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async uploadFile(file, path, metadata = {}) {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fullPath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(fullPath, file, { upsert: false });

    if (error) throw error;

    const { publicUrl } = supabase.storage.from(this.bucket).getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    };
  }

  async updateState(assetId, state, context = {}) {
    const { data, error } = await supabase
      .from('generated_assets')
      .update({ 
        state,
        ...context,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAsset(assetId) {
    const { data, error } = await supabase
      .from('generated_assets')
      .eq('id', assetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listAssets(filters = {}) {
    let query = supabase.from('generated_assets').select('*');

    if (filters.state) query = query.eq('state', filters.state);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async archiveAsset(assetId) {
    return this.updateState(assetId, this.states.ARCHIVED);
  }

  async deleteAsset(assetId) {
    const asset = await this.getAsset(assetId);
    if (asset?.storage_path) {
      await supabase.storage.from(this.bucket).remove([asset.storage_path]);
    }
    const { error } = await supabase.from('generated_assets').delete().eq('id', assetId);
    if (error) throw error;
    return { deleted: true };
  }

  async searchAssets(query, filters = {}) {
    let q = supabase.from('generated_assets').select('*');
    
    if (query) {
      q = q.or(`title.ilike.%${query}%,prompt.ilike.%${query}%`);
    }
    if (filters.userId) q = q.eq('user_id', filters.userId);
    if (filters.type) q = q.eq('type', filters.type);

    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}

const assetLifecycle = new AssetLifecycleManager();

export { AssetLifecycleManager, assetLifecycle };