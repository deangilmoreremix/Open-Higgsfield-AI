import { getSupabaseService } from './supabase.js';
import { AppError, ErrorCodes } from '../lib/errors.js';

export async function createJob(userId, agentId, input) {
  const { data, error } = await getSupabaseService().from('jobs').insert({ user_id: userId, agent_id: agentId, status: 'pending', input }).select().single();
  if (error) throw new AppError(ErrorCodes.INTERNAL, `Create job failed: ${error.message}`, 500);
  return data;
}

export async function updateJob(jobId, updates) {
  const { data, error } = await getSupabaseService().from('jobs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', jobId).select().single();
  if (error) throw new AppError(ErrorCodes.INTERNAL, `Update job failed: ${error.message}`, 500);
  return data;
}

export async function getJob(jobId, userId) {
  const { data, error } = await getSupabaseService().from('jobs').select('*').eq('id', jobId).eq('user_id', userId).maybeSingle();
  if (error) throw new AppError(ErrorCodes.INTERNAL, `Get job failed: ${error.message}`, 500);
  if (!data) throw new AppError(ErrorCodes.JOB_NOT_FOUND, `Job ${jobId} not found`, 404);
  return data;
}

export async function listJobs(userId, limit = 20) {
  const { data, error } = await getSupabaseService().from('jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw new AppError(ErrorCodes.INTERNAL, `List jobs failed: ${error.message}`, 500);
  return data || [];
}
