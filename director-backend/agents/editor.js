import { runAgent, withVideoDB, resolveVideo } from './_shared.js';

export async function editor(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'editor', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    const trimStart = params.options.trimStart || 0;
    const trimEnd = params.options.trimEnd || video.duration;
    await withVideoDB((conn) => timeline.addClip(0, { asset: video, duration: trimEnd - trimStart, start: trimStart }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { videoId: video.id, trimStart, trimEnd }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
