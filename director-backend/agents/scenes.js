import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function scenes(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'scenes', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const sceneCollection = await withVideoDB((conn) => video.extractScenes({ threshold: params.options.threshold || 0.5 }));
    const scenes = await withVideoDB((conn) => sceneCollection.getScenes());
    return { output: { scenes, count: scenes.length, threshold: params.options.threshold || 0.5 } };
  }, { input, videoId, videoUrl, options });
}
