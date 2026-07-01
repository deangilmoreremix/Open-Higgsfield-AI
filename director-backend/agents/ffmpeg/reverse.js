import { runAgent, resolveVideo, withVideoDB } from '../_shared.js';
import { runFfmpeg } from '../../services/ffmpeg.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function reverse(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'reverse', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const stream = await withVideoDB((conn) => video.generateStream());
    const inFile = path.join(os.tmpdir(), `rev-in-${Date.now()}.mp4`);
    const outFile = path.join(os.tmpdir(), `rev-out-${Date.now()}.mp4`);
    const res = await fetch(stream.url);
    await fs.writeFile(inFile, Buffer.from(await res.arrayBuffer()));
    await runFfmpeg(`-y -i "${inFile}" -vf reverse -af areverse -codec:v libx264 -codec:a aac "${outFile}"`);
    const output = await fs.readFile(outFile);
    await fs.unlink(inFile).catch(() => {});
    await fs.unlink(outFile).catch(() => {});
    return { output: { videoId: video.id, reversedSize: output.length, format: 'mp4' } };
  }, { input, videoId, videoUrl, options });
}
