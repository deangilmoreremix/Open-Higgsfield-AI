import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadToStorage(bucket, file, path) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(data.path)
}

export async function saveHeadshot(headshot) {
  const { data, error } = await supabase.from('headshots').insert([headshot])
  if (error) throw error
  return data
}

export async function getHeadshots(userId) {
  const { data, error } = await supabase.from('headshots').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}