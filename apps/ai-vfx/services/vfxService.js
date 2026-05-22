import { supabase } from '../../../lib/supabase-client.ts';
import { generateVideoFromText, generateVideoFromImage, generateVideo } from '../../../lib/muapi.js';

const STORAGE_KEY = 'higgsfield.ai-vfx.projects';

function safeReadStorage(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } }
function safeWriteStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

export const VFX_EFFECTS = [
  { id: 'none', name: 'No Effect', prompt: 'original video, no modifications' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'cinematic film look, anamorphic lens flare, dramatic color grading, film grain' },
  { id: 'anime', name: 'Anime', prompt: 'anime animation style, cel shading, vibrant colors, Japanese animation aesthetic' },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'cyberpunk aesthetic, neon lights, rain reflections, futuristic city vibe' },
  { id: 'vintage', name: 'Vintage Film', prompt: 'vintage film look, 35mm grain, warm color tones, nostalgic feel' },
  { id: 'dramatic', name: 'Dramatic', prompt: 'dramatic lighting, high contrast, deep shadows, intense mood' },
  { id: 'dreamscape', name: 'Dreamscape', prompt: 'dreamlike sequence, soft focus, ethereal glow, surreal atmosphere' },
  { id: 'action', name: 'Action Hero', prompt: 'action movie style, dynamic camera movement, intensity, hero shot' },
  { id: 'romantic', name: 'Romantic', prompt: 'romantic soft lighting, warm tones, gentle atmosphere, love story feel' },
  { id: 'horror', name: 'Horror', prompt: 'horror film atmosphere, dark shadows, eerie glow, suspenseful mood' },
  { id: 'comedy', name: 'Comedy', prompt: 'comedy film look, bright lighting, upbeat colors, fun atmosphere' },
  { id: 'documentary', name: 'Documentary', prompt: 'documentary style, natural lighting, authentic feel, raw footage look' }
];

export const MOTION_STYLES = [
  { id: 'static', name: 'Static', prompt: 'stable camera, no movement, centered subject' },
  { id: 'slow pan', name: 'Slow Pan', prompt: 'slow horizontal pan, cinematic reveal' },
  { id: 'tilt', name: 'Tilt', prompt: 'vertical camera tilt, scanning motion' },
  { id: 'zoom in', name: 'Zoom In', prompt: 'smooth zoom in effect, focus pull' },
  { id: 'zoom out', name: 'Zoom Out', prompt: 'smooth zoom out effect, expanding view' },
  { id: 'dolly', name: 'Dolly Shot', prompt: 'dolly movement, smooth forward/backward motion' },
  { id: 'orbit', name: 'Orbit', prompt: 'camera orbit around subject, circular motion' },
  { id: 'tracking', name: 'Tracking Shot', prompt: 'following moving subject, tracking camera' },
  { id: 'aerial', name: 'Aerial', prompt: 'aerial drone view, bird eye perspective' },
  { id: 'shake', name: 'Camera Shake', prompt: 'dynamic camera shake, intensity, handheld feel' }
];

export const ASPECT_RATIOS = [
  { id: '16:9', name: 'Landscape (16:9)', label: 'YouTube, Web' },
  { id: '9:16', name: 'Portrait (9:16)', label: 'TikTok, Reels, Shorts' },
  { id: '1:1', name: 'Square (1:1)', label: 'Instagram, Facebook' },
  { id: '4:3', name: 'Classic (4:3)', label: 'Traditional video' },
  { id: '21:9', name: 'Cinematic (21:9)', label: 'Cinema, Film' }
];

export const VIDEO_QUALITIES = [
  { id: '720p', name: 'HD (720p)', label: 'Fast processing' },
  { id: '1080p', name: 'Full HD (1080p)', label: 'Standard quality' },
  { id: '4k', name: '4K Ultra HD', label: 'Best quality' }
];

export async function generateVFXVideo(input, context = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const { prompt, effect, motion, aspect_ratio, quality, image_url } = input;

    let finalPrompt = prompt;
    if (effect && effect !== 'none') {
      const effectPreset = VFX_EFFECTS.find(e => e.id === effect);
      if (effectPreset) {
        finalPrompt = `${prompt}. Apply ${effectPreset.name} effect: ${effectPreset.prompt}`;
      }
    }

    if (motion) {
      const motionPreset = MOTION_STYLES.find(m => m.id === motion);
      if (motionPreset) {
        finalPrompt = `${finalPrompt}. Camera motion: ${motionPreset.prompt}`;
      }
    }

    if (image_url) {
      return generateVideoFromImage(image_url, finalPrompt, context);
    } else {
      return generateVideoFromText(finalPrompt, context);
    }
  } catch (err) {
    console.error('VFX generateVFXVideo error:', err);
    throw err;
  }
}

export async function applyEffect(sourceVideoUrl, effectPreset, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const effect = VFX_EFFECTS.find(e => e.id === effectPreset) || VFX_EFFECTS[0];
    const prompt = `Apply ${effect.name} effect to video: ${effect.prompt}. ${options.additionalPrompt || ''}`;

    return generateVideo(apiKey, {
      prompt,
      image_url: sourceVideoUrl,
      duration: options.duration || 5,
      model: options.model || 'seedance-i2v'
    });
  } catch (err) {
    console.error('VFX applyEffect error:', err);
    throw err;
  }
}

export async function addMotion(sourceVideoUrl, motionPreset, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const motion = MOTION_STYLES.find(m => m.id === motionPreset) || MOTION_STYLES[0];
    const prompt = `Apply ${motion.name} camera motion: ${motion.prompt}`;

    return generateVideo(apiKey, {
      prompt,
      image_url: sourceVideoUrl,
      duration: options.duration || 5,
      model: 'seedance-i2v'
    });
  } catch (err) {
    console.error('VFX addMotion error:', err);
    throw err;
  }
}

export async function combineVideos(videoUrls, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const prompt = options.prompt || 'Combine these video clips into a seamless sequence';

    return generateVideo(apiKey, {
      prompt,
      videos_list: videoUrls,
      duration: options.duration || 10,
      model: 'seedance-video-combiner'
    });
  } catch (err) {
    console.error('VFX combineVideos error:', err);
    throw err;
  }
}

export async function extendVideo(sourceVideoUrl, duration, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const prompt = options.prompt || 'Extend this video sequence smoothly';

    return generateVideo(apiKey, {
      prompt,
      image_url: sourceVideoUrl,
      duration: duration,
      model: 'seedance-video-extend'
    });
  } catch (err) {
    console.error('VFX extendVideo error:', err);
    throw err;
  }
}

export async function listVFXProjects() {
  try {
    const { data, error } = await supabase.from('vfx_projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('VFX listProjects error:', err);
    return safeReadStorage(STORAGE_KEY, []);
  }
}

export async function saveVFXProject(project) {
  try {
    const { data, error } = await supabase.from('vfx_projects').insert(project).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('VFX saveProject error:', err);
    const id = 'vfx_' + Date.now();
    const newProject = { id, ...project, created_at: new Date().toISOString() };
    safeWriteStorage(STORAGE_KEY, [...safeReadStorage(STORAGE_KEY, []), newProject]);
    return newProject;
  }
}

export async function getVFXProject(id) {
  try {
    const { data, error } = await supabase.from('vfx_projects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('VFX getProject error:', err);
    return null;
  }
}

export async function deleteVFXProject(id) {
  try {
    await supabase.from('vfx_projects').delete().eq('id', id);
  } catch (err) {
    console.error('VFX deleteProject error:', err);
  }
}

export function handoffVFXOutput(target, output) {
  const HANDOFF_KEYS = {
    library: 'higgsfield.pendingLibraryOutput',
    render: 'higgsfield.pendingRenderOutput',
    timeline: 'higgsfield.pendingTimelineOutput',
    director: 'higgsfield.pendingDirectorOutput',
    'edit-studio': 'higgsfield.pendingEditStudioOutput'
  };
  if (HANDOFF_KEYS[target]) {
    sessionStorage.setItem(HANDOFF_KEYS[target], JSON.stringify({ content: output, app: 'ai-vfx' }));
  }
}

export async function generateThumbnail(videoUrl, options = {}) {
  try {
    return { thumbnail_url: videoUrl, timestamp: options.timestamp || 0 };
  } catch (err) {
    console.error('VFX generateThumbnail error:', err);
    throw err;
  }
}

export async function getVideoMetadata(videoUrl) {
  try {
    return {
      url: videoUrl,
      duration: 5,
      width: 1920,
      height: 1080,
      fps: 30,
      codec: 'h264'
    };
  } catch (err) {
    console.error('VFX getMetadata error:', err);
    throw err;
  }
}