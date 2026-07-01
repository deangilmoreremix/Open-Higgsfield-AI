import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
  return Buffer.from(hex, 'hex');
}

export function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return { ciphertext: ct, iv, authTag: cipher.getAuthTag() };
}

export function decrypt({ ciphertext, iv, authTag }) {
  const key = getKey();
  const d = crypto.createDecipheriv(ALGO, key, iv);
  d.setAuthTag(authTag);
  return Buffer.concat([d.update(ciphertext), d.final()]).toString('utf8');
}
