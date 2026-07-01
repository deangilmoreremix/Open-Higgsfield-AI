import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../../services/encryption.js';

describe('encryption service', () => {
  it('round-trips a value', () => {
    const plaintext = JSON.stringify({ webhook: 'https://x' });
    const enc = encrypt(plaintext);
    expect(enc.ciphertext).toBeInstanceOf(Buffer);
    expect(decrypt(enc)).toBe(plaintext);
  });
  it('produces different IVs for same plaintext', () => {
    const a = encrypt('x');
    const b = encrypt('x');
    expect(a.iv.equals(b.iv)).toBe(false);
  });
});
