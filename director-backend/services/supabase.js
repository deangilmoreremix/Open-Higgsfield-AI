import { createClient } from '@supabase/supabase-js';
import { AppError, ErrorCodes } from '../lib/errors.js';

let _anon = null;
let _service = null;

export function getSupabaseAnon() {
  if (!_anon) {
    _anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  }
  return _anon;
}

export function getSupabaseService() {
  if (!_service) {
    _service = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  }
  return _service;
}

export async function validateJwt(token) {
  if (!token) throw new AppError(ErrorCodes.INVALID_AUTH, 'No token provided', 401);
  const { data, error } = await getSupabaseAnon().auth.getUser(token);
  if (error || !data.user) throw new AppError(ErrorCodes.INVALID_AUTH, 'Invalid or expired token', 401);
  return data.user;
}
