import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function savePomodoroSession(session) {
  const { data, error } = await supabase.from('pomodoro_sessions').insert([session])
  if (error) throw error
  return data
}

export async function getPomodoroSessions(userId) {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getDailyStats(userId, date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
  if (error) throw error
  return data
}

export async function updateStreak(userId, streak) {
  const { data, error } = await supabase
    .from('user_stats')
    .upsert({ user_id: userId, streak, last_active: new Date().toISOString() })
  if (error) throw error
  return data
}

export async function uploadToStorage(bucket, file, path) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(data.path)
}