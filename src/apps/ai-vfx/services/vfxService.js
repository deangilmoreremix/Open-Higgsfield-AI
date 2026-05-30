import { supabase } from '../../../lib/supabase-client.ts';
import { generateVideoEffect, uploadFile, generateI2V, generateVideo } from '../../../lib/muapi.js';
import { securityService } from '../../../lib/services/SecurityService.js';

const STORAGE_KEY = 'higgsfield.ai-vfx.outputs';

function safeReadStorage(key, fallback) { 
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } 
  catch { return fallback; } 
}
function safeWriteStorage(key, value) { 
  try { localStorage.setItem(key, JSON.stringify(value)); } 
  catch {} 
}

export async function generateVFX(apiKey, params) {
  try {
    const result = await generateVideoEffect({ ...params, apiKey });
    return result;
  } catch (err) {
    console.error('ai-vfx generateVFX error:', err);
    throw err;
  }
}

export async function generateVFXFromImage(apiKey, imageUrl, effect, options = {}) {
  const inputType = effect.input_type || 'i2v';
  const triggerWord = effect.trigger_word || `Apply ${effect.name} effect`;
  
  if (inputType === 't2v') {
    return generateVideo(apiKey, {
      prompt: triggerWord,
      ...options
    });
  }
  
  return generateI2V(apiKey, {
    prompt: triggerWord,
    image_url: imageUrl,
    ...options
  });
}

export async function uploadSourceImage(file) {
  const apiKey = await securityService.getDecryptedKey();
  if (!apiKey) throw new Error('API key not configured');
  return uploadFile(apiKey, file);
}

export async function saveOutput(output) {
  try {
    const { data, error } = await supabase.from('vfx_outputs').insert({
      ...output,
      created_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('ai-vfx saveOutput error:', err);
    const id = 'vfx_' + Date.now();
    safeWriteStorage(STORAGE_KEY, [...safeReadStorage(STORAGE_KEY, []), { id, ...output }]);
    return { id, ...output };
  }
}

export async function listOutputs() {
  try {
    const { data, error } = await supabase.from('vfx_outputs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    return safeReadStorage(STORAGE_KEY, []);
  }
}

export async function saveOutputToLibrary(output) {
  try {
    const { data, error } = await supabase.from('generation_jobs').insert({
      job_type: 'ai-vfx',
      output_url: output.url,
      input: { prompt: output.prompt, effect: output.name },
      status: 'completed'
    }).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
}

export function handoffOutput(target, output) {
  const HANDOFF_KEYS = {
    library: 'higgsfield.pendingLibraryOutput',
    render: 'higgsfield.pendingRenderOutput',
    director: 'higgsfield.pendingDirectorOutput',
    timeline: 'higgsfield.pendingTimelineOutput',
    'edit-studio': 'higgsfield.pendingEditStudioOutput'
  };
  if (HANDOFF_KEYS[target]) {
    sessionStorage.setItem(HANDOFF_KEYS[target], JSON.stringify({ content: output, app: 'ai-vfx' }));
  }
}