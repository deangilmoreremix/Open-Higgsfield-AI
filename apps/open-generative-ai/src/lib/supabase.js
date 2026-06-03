import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadToStorage(bucket, file, path) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(data.path)
}

export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function listFiles(bucket, path = '') {
  const { data, error } = await supabase.storage.from(bucket).list(path)
  if (error) throw error
  return data
}

export async function saveProject(project) {
  const { data, error } = await supabase.from('projects').insert([project])
  if (error) throw error
  return data
}

export async function getProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}