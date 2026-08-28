import { getDatabase } from './db.mjs';

const MAX_KEY_LENGTH = 512;

/** @type {{ db: unknown, getAll: any, get: any, set: any, remove: any } | null} */
let statements = null;

function prepared() {
  const db = getDatabase();
  if (statements?.db === db) {
    return statements;
  }
  statements = {
    db,
    getAll: db.prepare('SELECT key, value FROM kv'),
    get: db.prepare('SELECT value FROM kv WHERE key = ?'),
    set: db.prepare(
      `INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    ),
    remove: db.prepare('DELETE FROM kv WHERE key = ?'),
  };
  return statements;
}

/** @param {unknown} key */
export function assertKey(key) {
  if (typeof key !== 'string' || key.length === 0 || key.length > MAX_KEY_LENGTH) {
    throw new Error('Invalid storage key');
  }
}

/** @param {unknown} value */
export function assertValue(value) {
  if (typeof value !== 'string') {
    throw new Error('Invalid storage value');
  }
}

/** @returns {Record<string, string>} */
export function getAll() {
  /** @type {Record<string, string>} */
  const result = {};
  for (const row of prepared().getAll.all()) {
    result[row.key] = row.value;
  }
  return result;
}

/**
 * @param {string} key
 * @returns {string | null}
 */
export function get(key) {
  assertKey(key);
  const row = prepared().get.get(key);
  return row ? row.value : null;
}

/**
 * @param {string} key
 * @param {string} value
 */
export function set(key, value) {
  assertKey(key);
  assertValue(value);
  prepared().set.run(key, value, Date.now());
}

/** @param {string} key */
export function remove(key) {
  assertKey(key);
  prepared().remove.run(key);
}
