import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function subtitler(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'subtitler', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    await withVideoDB((conn) => video.indexSpokenWords());
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: video, duration: video.duration, caption: { src: 'auto', language: params.options.language || 'en' } }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { language: params.options.language || 'en', videoId: video.id }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
