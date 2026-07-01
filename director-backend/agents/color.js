import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

const FILTERS = ['greyscale', 'blur', 'boost', 'contrast', 'darken', 'lighten', 'muted', 'negative'];

export async function color(userId, { input, videoId, videoUrl, options = {} }) {
  const filter = (options.filter || input || 'greyscale').toLowerCase();
  if (!FILTERS.includes(filter)) throw new Error(`filter must be one of: ${FILTERS.join(', ')}`);
  return runAgent(userId, 'color', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    const filterKey = params.options.filter || params.input || 'greyscale';
    await withVideoDB((conn) => timeline.addClip(0, { asset: video, duration: video.duration, filter: filterKey }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { videoId: video.id, filter: filterKey, availableFilters: FILTERS }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
