import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function speed(userId, { input, videoId, videoUrl, options = {} }) {
  const speed = options.speed || 1.0;
  if (speed <= 0) throw new Error('speed must be positive');
  return runAgent(userId, 'speed', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const newDuration = video.duration / params.options.speed;
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: video, duration: newDuration }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { videoId: video.id, speed, newDuration }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
