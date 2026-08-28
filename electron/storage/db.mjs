import fs from 'node:fs';

/** @typedef {import('node:sqlite').DatabaseSync} DatabaseSync */

/** @type {DatabaseSync | null} */
let db = null;
let persistent = false;
let warningPatched = false;

/**
 * Ordered schema migrations. Index N brings the database from
 * `user_version = N` to `N + 1`. Append new steps; never edit existing ones.
 */
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS kv (
    key        TEXT PRIMARY KEY NOT NULL,
    value      TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  ) WITHOUT ROWID;`,
];

/**
 * `node:sqlite` prints an ExperimentalWarning on first load. A `process.on('warning')`
 * listener does not stop Node's default stderr printer and `--no-warnings` is too
 * broad, so drop just this one warning at the source.
 */
function suppressSqliteExperimentalWarning() {
  if (warningPatched) return;
  warningPatched = true;

  const original = process.emitWarning;
  process.emitWarning = function patchedEmitWarning(warning, ...rest) {
    const options = rest[0];
    const type =
      typeof options === 'string' ? options : (options?.type ?? warning?.name ?? undefined);
    const message = typeof warning === 'string' ? warning : (warning?.message ?? '');
    if (type === 'ExperimentalWarning' && /sqlite/i.test(message)) {
      return;
    }
    return original.call(process, warning, ...rest);
  };
}

/** @param {DatabaseSync} database */
function applyPragmas(database) {
  database.exec('PRAGMA journal_mode = WAL');
  database.exec('PRAGMA synchronous = NORMAL');
  database.exec('PRAGMA busy_timeout = 5000');
  database.exec('PRAGMA foreign_keys = ON');
}

/** @param {DatabaseSync} database */
function migrate(database) {
  const row = database.prepare('PRAGMA user_version').get();
  const current = Number(row?.user_version ?? 0);

  for (let version = current; version < MIGRATIONS.length; version++) {
    database.exec('BEGIN');
    try {
      database.exec(MIGRATIONS[version]);
      database.exec(`PRAGMA user_version = ${version + 1}`);
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  }
}

/**
 * @param {typeof import('node:sqlite').DatabaseSync} Database
 * @param {string} filePath
 */
function openAndMigrate(Database, filePath) {
  const database = new Database(filePath);
  try {
    if (filePath !== ':memory:') {
      applyPragmas(database);
    }
    migrate(database);
    return database;
  } catch (error) {
    try {
      database.close();
    } catch {
      // ignore
    }
    throw error;
  }
}

/**
 * Opens (or creates) the application database. Never throws: a corrupt file is
 * moved aside and recreated, and if even that fails the app runs on an
 * in-memory database so startup is not blocked.
 *
 * @param {string} filePath
 * @returns {Promise<DatabaseSync>}
 */
export async function openDatabase(filePath) {
  if (db) return db;

  suppressSqliteExperimentalWarning();
  // Dynamic import so the warning patch above is installed before the module loads.
  const { DatabaseSync } = await import('node:sqlite');

  try {
    db = openAndMigrate(DatabaseSync, filePath);
    persistent = true;
    return db;
  } catch (error) {
    console.error(`[storage] Failed to open ${filePath}:`, error);
  }

  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.corrupt-${Date.now()}`;
    try {
      fs.renameSync(filePath, backupPath);
      for (const suffix of ['-wal', '-shm']) {
        fs.rmSync(`${filePath}${suffix}`, { force: true });
      }
      console.error(`[storage] Moved unreadable database to ${backupPath}`);
      db = openAndMigrate(DatabaseSync, filePath);
      persistent = true;
      return db;
    } catch (error) {
      console.error('[storage] Retry after moving database failed:', error);
    }
  }

  console.error('[storage] Falling back to in-memory database; settings will not persist.');
  db = openAndMigrate(DatabaseSync, ':memory:');
  persistent = false;
  return db;
}

/** @returns {DatabaseSync} */
export function getDatabase() {
  if (!db) {
    throw new Error('Storage database is not open');
  }
  return db;
}

export function isDatabasePersistent() {
  return persistent;
}

export function closeDatabase() {
  if (!db) return;
  try {
    db.close();
  } catch (error) {
    console.error('[storage] Failed to close database:', error);
  }
  db = null;
}
