import { describe, it, expect, vi } from 'vitest';
import { requireAuth } from '../../../middleware/auth.js';
import { AppError } from '../../../lib/errors.js';

vi.mock('../../../services/supabase.js', () => ({
  validateJwt: vi.fn(async (t) => t === 'valid' ? { id: 'u1' } : Promise.reject(new AppError('INVALID_AUTH', 'bad', 401))),
}));

const req = (t) => ({ headers: { authorization: t ? `Bearer ${t}` : '' } });
const res = () => { const r = {}; r.status = vi.fn(() => r); r.json = vi.fn(() => r); return r; };
const next = () => vi.fn();

describe('requireAuth', () => {
  it('attaches user and calls next on valid token', async () => {
    const r = req('valid'); const s = res(); const n = next();
    await requireAuth(r, s, n);
    expect(r.user.id).toBe('u1');
    expect(n).toHaveBeenCalled();
  });
  it('returns 401 with no token', async () => {
    const r = req(); const s = res(); const n = next();
    await requireAuth(r, s, n);
    expect(s.status).toHaveBeenCalledWith(401);
  });
});
