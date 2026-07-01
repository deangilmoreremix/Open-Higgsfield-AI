import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function highlighter(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'highlighter', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const sceneCollection = await withVideoDB((conn) => video.extractScenes());
    const scenes = await withVideoDB((conn) => sceneCollection.getScenes());
    const top = scenes.slice(0, params.options.limit || 3);
    return { output: { highlights: top, count: top.length, totalScenes: scenes.length } };
  }, { input, videoId, videoUrl, options });
}
