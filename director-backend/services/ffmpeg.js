import ffmpegPath from 'ffmpeg-static';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AppError, ErrorCodes } from '../lib/errors.js';

const execAsync = promisify(exec);

export async function runFfmpeg(args, timeoutMs = 300_000) {
  try {
    const { stdout, stderr } = await execAsync(`"${ffmpegPath}" ${args}`, { maxBuffer: 50 * 1024 * 1024, timeout: timeoutMs });
    return { stdout, stderr };
  } catch (err) {
    throw new AppError(ErrorCodes.FFMPEG_ERROR, `ffmpeg failed: ${err.message}`, 500, { stderr: err.stderr?.slice(-500) });
  }
}
