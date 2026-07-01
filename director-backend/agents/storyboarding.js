import { runAgent, resolveVideo, withVideoDB, getOrCreateCollection } from './_shared.js';

export async function storyboarding(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'storyboarding', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const sceneCollection = await withVideoDB((conn) => video.extractScenes());
    const scenes = await withVideoDB((conn) => sceneCollection.getScenes());
    const collection = await getOrCreateCollection();
    const frames = [];
    for (const scene of scenes.slice(0, 6)) {
      const img = await withVideoDB((conn) => collection.generateImage({ prompt: `Storyboard frame: ${scene.description || 'a scene'}` }));
      frames.push({ sceneId: scene.id, imageId: img.id });
    }
    return { output: { frames, count: frames.length } };
  }, { input, videoId, videoUrl, options });
}
