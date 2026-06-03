import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function saveUGC(ugc) {
  const { data, error } = await supabase.from('ugc_content').insert([ugc])
  if (error) throw error
  return data
}

export async function getUGCList() {
  const { data, error } = await supabase.from('ugc_content').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadToStorage(bucket, file, path) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(data.path)
}