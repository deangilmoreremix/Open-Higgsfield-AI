import { runAgent, resolveVideo, withVideoDB } from '../_shared.js';
import { runFfmpeg } from '../../services/ffmpeg.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function stabilize(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'stabilize', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const stream = await withVideoDB((conn) => video.generateStream());
    const inFile = path.join(os.tmpdir(), `in-${Date.now()}.mp4`);
    const trfFile = path.join(os.tmpdir(), `trf-${Date.now()}.trf`);
    const outFile = path.join(os.tmpdir(), `out-${Date.now()}.mp4`);
    const res = await fetch(stream.url);
    await fs.writeFile(inFile, Buffer.from(await res.arrayBuffer()));
    await runFfmpeg(`-y -i "${inFile}" -vf vidstabdetect=shakiness=8:accuracy=15:result="${trfFile}" -f null -`);
    await runFfmpeg(`-y -i "${inFile}" -vf vidstabtransform=smoothing=30:input="${trfFile}",unsharp=5:5:0.8:3:3:0.4 -codec:a copy "${outFile}"`);
    const output = await fs.readFile(outFile);
    await fs.unlink(inFile).catch(() => {});
    await fs.unlink(trfFile).catch(() => {});
    await fs.unlink(outFile).catch(() => {});
    return { output: { videoId: video.id, stabilizedSize: output.length, format: 'mp4' } };
  }, { input, videoId, videoUrl, options });
}
