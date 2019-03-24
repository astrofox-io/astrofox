import crypto from 'crypto';

export function sha1(s) {
  return crypto
    .createHash('sha1')
    .update(s)
    .digest('hex');
}

export function sha256(s) {
  return crypto
    .createHash('sha256')
    .update(s)
    .digest('hex');
}

export function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}
