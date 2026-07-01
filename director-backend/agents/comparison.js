import { runAgent, withVideoDB } from './_shared.js';

export async function comparison(userId, { input, options = {} }) {
  const { videoIdA, videoIdB } = options;
  if (!videoIdA || !videoIdB) throw new Error('videoIdA and videoIdB are required');
  return runAgent(userId, 'comparison', async (params) => {
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    const a = await withVideoDB((conn) => conn.getVideo(params.options.videoIdA));
    const b = await withVideoDB((conn) => conn.getVideo(params.options.videoIdB));
    await withVideoDB((conn) => timeline.addClip(0, { asset: a, duration: 5, position: 'top_left', scale: 0.5 }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: b, duration: 5, position: 'bottom_right', scale: 0.5 }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { videoIdA, videoIdB }, streamUrl: streamUrl.url };
  }, { input, options });
}
