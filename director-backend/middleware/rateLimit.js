import { AppError, ErrorCodes } from '../lib/errors.js';

const WINDOW = 60_000;
const MAX = 10;
const store = new Map();

export function rateLimit(req, res, next) {
  const id = req.user?.id || req.ip || 'anon';
  const now = Date.now();
  const e = store.get(id) || { requests: [] };
  e.requests = e.requests.filter((t) => now - t < WINDOW);
  if (e.requests.length >= MAX) {
    res.setHeader('Retry-After', Math.ceil((WINDOW - (now - e.requests[0])) / 1000));
    return next(new AppError(ErrorCodes.RATE_LIMITED, 'Too many requests', 429));
  }
  e.requests.push(now);
  store.set(id, e);
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [k, e] of store.entries()) {
    e.requests = e.requests.filter((t) => now - t < WINDOW);
    if (!e.requests.length) store.delete(k);
  }
}, WINDOW).unref();
