import { supabase, isSupabaseConfigured } from './supabase.js';

if (!isSupabaseConfigured()) {
  console.warn('[AssetPipeline] Supabase not configured - using mock client');
}

class AssetPipeline {
  constructor(options = {}) {
    this.bucket = options.bucket || 'generated-assets';
    this.maxRetries = options.maxRetries || 3;
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024;
  }

  async upload(file, path, metadata = {}) {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fullPath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { publicUrl } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    const assetRecord = {
      storage_path: data.path,
      public_url: publicUrl,
      file_name: fileName,
      file_size: file.size,
      mime_type: file.type,
      metadata: { ...metadata, uploadedAt: new Date().toISOString() }
    };

    return assetRecord;
  }

  async uploadFromUrl(url, path, metadata = {}) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
    
    const blob = await response.blob();
    const file = new File([blob], metadata.fileName || 'asset', { type: blob.type });
    
    return this.upload(file, path, metadata);
  }

  async getSignedUrl(path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  async list(prefix) {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .list(prefix);

    if (error) throw error;
    return data;
  }

  async remove(paths) {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .remove(paths);

    if (error) throw error;
    return data;
  }

  async download(path) {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .download(path);

    if (error) throw error;
    return data;
  }
}

const assetPipeline = new AssetPipeline();

export { AssetPipeline };
export default assetPipeline;