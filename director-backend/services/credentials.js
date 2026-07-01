import { getSupabaseService } from './supabase.js';
import { encrypt, decrypt } from './encryption.js';
import { AppError, ErrorCodes } from '../lib/errors.js';

export async function saveIntegration(userId, type, credentials) {
  const supabase = getSupabaseService();
  const { ciphertext, iv, authTag } = encrypt(JSON.stringify(credentials));
  const { data, error } = await supabase.from('user_integrations').upsert({
    user_id: userId,
    integration_type: type,
    credentials_encrypted: ciphertext,
    iv,
    auth_tag: authTag,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,integration_type' }).select().single();
  if (error) throw new AppError(ErrorCodes.INTERNAL, `Save failed: ${error.message}`, 500);
  return data;
}

export async function getIntegration(userId, type) {
  const supabase = getSupabaseService();
  const { data, error } = await supabase.from('user_integrations').select('*').eq('user_id', userId).eq('integration_type', type).maybeSingle();
  if (error) throw new AppError(ErrorCodes.INTERNAL, `Fetch failed: ${error.message}`, 500);
  if (!data) return null;
  return JSON.parse(decrypt({ ciphertext: data.credentials_encrypted, iv: data.iv, authTag: data.auth_tag }));
}

export async function deleteIntegration(userId, type) {
  const supabase = getSupabaseService();
  const { error } = await supabase.from('user_integrations').delete().eq('user_id', userId).eq('integration_type', type);
  if (error) throw new AppError(ErrorCodes.INTERNAL, `Delete failed: ${error.message}`, 500);
}

export async function listIntegrations(userId) {
  const supabase = getSupabaseService();
  const { data, error } = await supabase.from('user_integrations').select('integration_type, created_at, updated_at').eq('user_id', userId);
  if (error) throw new AppError(ErrorCodes.INTERNAL, `List failed: ${error.message}`, 500);
  return data || [];
}
