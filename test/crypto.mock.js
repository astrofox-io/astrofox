import crypto from 'crypto';

Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
  },
});
