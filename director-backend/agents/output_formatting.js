import { runAgent, withVideoDB } from './_shared.js';

export async function output_formatting(userId, { input, options = {} }) {
  const { videoId, format = 'mp4', resolution = '1080p' } = options;
  if (!videoId) throw new Error('videoId is required');
  return runAgent(userId, 'output_formatting', async (params) => {
    const stream = await withVideoDB(async (conn) => {
      const video = await conn.getVideo(params.options.videoId);
      return video.generateStream({ format: params.options.format || 'mp4', resolution: params.options.resolution || '1080p' });
    });
    return { output: { videoId, format, resolution, streamId: stream.id }, streamUrl: stream.url };
  }, { input, options });
}
