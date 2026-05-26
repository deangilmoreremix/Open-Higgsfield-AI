import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getUser = async (userId) => {
  const { data, error } = await supabase
    .from('vimax_users')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertUser = async (userId) => {
  const { data, error } = await supabase
    .from('vimax_users')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateUserStats = async (userId, stats) => {
  const { error } = await supabase
    .from('vimax_users')
    .update({ stats })
    .eq('user_id', userId);
  if (error) throw error;
};

export const getUserJobs = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('vimax_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
};

export const insertJob = async (jobData) => {
  const { data, error } = await supabase
    .from('vimax_jobs')
    .insert(jobData)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateJob = async (jobId, updates) => {
  const { error } = await supabase
    .from('vimax_jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', jobId);
  if (error) throw error;
};

export const getFeaturedTemplates = async () => {
  const { data, error } = await supabase
    .from('vimax_templates')
    .select('*')
    .eq('is_featured', true)
    .order('usage_count', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getAllTemplates = async () => {
  const { data, error } = await supabase
    .from('vimax_templates')
    .select('*')
    .order('usage_count', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const incrementTemplateUsage = async (templateId) => {
  const { data: template } = await supabase
    .from('vimax_templates')
    .select('usage_count')
    .eq('id', templateId)
    .maybeSingle();
  if (template) {
    await supabase
      .from('vimax_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', templateId);
  }
};

export const insertFeedback = async (feedbackData) => {
  const { data, error } = await supabase
    .from('vimax_feedback')
    .insert(feedbackData)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const trackPipelineSelection = async ({ userId, pipelineType, source }) => {
  const edgeUrl = `${supabaseUrl}/functions/v1/track-event`;
  await fetch(edgeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Apikey': supabaseAnonKey,
    },
    body: JSON.stringify({ user_id: userId, pipeline_type: pipelineType, source }),
  });
};

export const getUserBatches = async (userId) => {
  const { data, error } = await supabase
    .from('vimax_batches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const insertVideoUpload = async (uploadData) => {
  const { data, error } = await supabase
    .from('vimax_video_uploads')
    .insert(uploadData)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getUserVideoUploads = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('vimax_video_uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
};

export const updateVideoUpload = async (uploadId, updates) => {
  const { error } = await supabase
    .from('vimax_video_uploads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', uploadId);
  if (error) throw error;
};

export const deleteVideoUpload = async (uploadId) => {
  const { error } = await supabase
    .from('vimax_video_uploads')
    .delete()
    .eq('id', uploadId);
  if (error) throw error;
};
