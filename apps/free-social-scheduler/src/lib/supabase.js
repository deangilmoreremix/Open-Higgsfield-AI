import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function savePost(post) {
  const { data, error } = await supabase.from('scheduled_posts').insert([post])
  if (error) throw error
  return data
}

export async function getScheduledPosts() {
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .order('scheduled_for', { ascending: true })
  if (error) throw error
  return data
}

export async function updatePost(id, updates) {
  const { data, error } = await supabase
    .from('scheduled_posts')
    .update(updates)
    .eq('id', id)
  if (error) throw error
  return data
}

export async function deletePost(id) {
  const { error } = await supabase.from('scheduled_posts').delete().eq('id', id)
  if (error) throw error
}

export async function uploadMedia(file, bucket = 'social-media') {
  const path = `${bucket}/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(data.path)
}