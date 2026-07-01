import { connect } from 'videodb';
import { AppError, ErrorCodes } from '../lib/errors.js';

let _conn = null;

export function getVideoDB() {
  if (!_conn) {
    if (!process.env.VIDEO_DB_API_KEY) throw new AppError(ErrorCodes.INVALID_INPUT, 'VIDEO_DB_API_KEY not configured', 500);
    _conn = connect({ apiKey: process.env.VIDEO_DB_API_KEY });
  }
  return _conn;
}

export async function withVideoDB(fn) {
  try {
    return await fn(getVideoDB());
  } catch (err) {
    throw new AppError(
      ErrorCodes.VIDEODB_ERROR,
      err?.message || 'VideoDB request failed',
      502,
      { original: err?.name }
    );
  }
}

export async function getOrCreateCollection(name = 'default') {
  return withVideoDB(async (conn) => {
    const list = await conn.getCollections();
    const existing = list.find((c) => c.name === name);
    return existing || conn.createCollection(name);
  });
}
