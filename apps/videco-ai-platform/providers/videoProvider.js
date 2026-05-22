import { muapi } from '../../../lib/muapi.js';

export async function generateVideoFromText(prompt, context = {}) {
  const params = {
    prompt,
    model: context.model || 'wan-2.1-video-generation',
    aspect_ratio: context.aspectRatio || '16:9',
    duration: context.duration || 5,
    resolution: context.resolution || '720p',
    quality: context.quality || 'high',
    onRequestId: context.onRequestId
  };

  return await muapi.generateVideo(params);
}

export async function generateVideoFromImage(imageUrl, prompt, context = {}) {
  const params = {
    prompt,
    image_url: imageUrl,
    model: context.model || 'wan-2.1-i2v-generation',
    aspect_ratio: context.aspectRatio || '16:9',
    duration: context.duration || 5,
    resolution: context.resolution || '720p',
    quality: context.quality || 'high',
    onRequestId: context.onRequestId
  };

  return await muapi.generateI2V(params);
}

export async function generateCinematicScene(prompt, context = {}) {
  const params = {
    prompt,
    model: context.model || 'wan-2.1-video-generation',
    aspect_ratio: context.aspectRatio || '16:9',
    duration: context.duration || 10,
    resolution: context.resolution || '1080p',
    quality: context.quality || 'high',
    mode: 'cinematic',
    onRequestId: context.onRequestId
  };

  return await muapi.generateVideo(params);
}

export async function applyVideoEffect(videoUrl, effectName, context = {}) {
  const params = {
    prompt: effectName,
    video_url: videoUrl,
    name: effectName,
    aspect_ratio: context.aspectRatio || '9:16',
    size: context.size || '480*832',
    quality: context.quality || 'medium',
    duration: context.duration || 5,
    onRequestId: context.onRequestId
  };

  return await muapi.generateVideoEffect(params);
}

export async function processVideoToVideo(videoUrl, prompt, context = {}) {
  const params = {
    video_url: videoUrl,
    prompt,
    model: context.model || 'wan-2.1-v2v',
    onRequestId: context.onRequestId
  };

  return await muapi.processV2V(params);
}

export async function addLipSync(videoUrl, audioUrl, context = {}) {
  const params = {
    video_url: videoUrl,
    audio_url: audioUrl,
    onRequestId: context.onRequestId
  };

  return await muapi.processLipSync(params);
}