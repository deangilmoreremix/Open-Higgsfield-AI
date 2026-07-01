import { validateJwt } from '../services/supabase.js';

export async function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  try {
    req.user = await validateJwt(token);
    next();
  } catch (err) {
    res.status(err.status || 401).json({
      error: {
        code: err.code || 'INVALID_AUTH',
        message: err.message,
      },
    });
  }
}
