import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadToStorage(bucket, file, path) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type })
  if (error) throw error
  return data
}

export async function downloadFromStorage(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error) throw error
  return URL.createObjectURL(data)
}

export async function listStorageFiles(bucket, path = '') {
  const { data, error } = await supabase.storage.from(bucket).list(path)
  if (error) throw error
  return data
}

export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function invokeEdgeFunction(functionName, body) {
  const { data, error } = await supabase.functions.invoke(functionName, { body })
  if (error) throw error
  return data
}