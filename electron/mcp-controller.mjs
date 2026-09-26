import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const validToken = token => typeof token === 'string' && /^[!-~]{32,256}$/.test(token);
const validPort = port => Number.isInteger(port) && port > 0 && port <= 65535;

/** Owns persisted MCP preferences and serializes start/stop/reset operations. */
export async function createMcpController(options) {
  const { ipcMain, getWindow, userDataPath } = options;
  const settingsPath = path.join(userDataPath, 'mcp-settings.json');
  let config = { enabled: false, port: 43120, token: randomBytes(32).toString('hex') };
  let error = null;
  let stopServer = null;
  let quitting = false;
  let queue = Promise.resolve();

  async function persist(next) {
    await fs.mkdir(userDataPath, { recursive: true });
    const temporary = `${settingsPath}.tmp`;
    try {
      await fs.writeFile(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
      await fs.rename(temporary, settingsPath);
    } finally {
      await fs.unlink(temporary).catch(() => {});
    }
  }

  try {
    const saved = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
    if (typeof saved.enabled !== 'boolean' || !validPort(saved.port) || !validToken(saved.token)) {
      throw new Error(
        'Invalid saved MCP settings. Change the setting to save a fresh configuration.',
      );
    }
    config = { enabled: saved.enabled, port: saved.port, token: saved.token };
  } catch (cause) {
    if (cause.code === 'ENOENT') {
      // Preserve the existing connection when upgrading the environment-only server.
      let previous;
      try {
        previous = JSON.parse(await fs.readFile(path.join(userDataPath, 'mcp.json'), 'utf8'));
      } catch {
        /* No previous credentials to migrate. */
      }
      const envPort = Number(process.env.ASTROFOX_MCP_PORT || 43120);
      config = {
        enabled: process.env.ASTROFOX_MCP === '1',
        port: validPort(envPort) ? envPort : 43120,
        token: validToken(process.env.ASTROFOX_MCP_TOKEN)
          ? process.env.ASTROFOX_MCP_TOKEN
          : validToken(previous?.token)
            ? previous.token
            : config.token,
      };
      try {
        await persist(config);
      } catch (cause) {
        config.enabled = false;
        error = `Could not save MCP settings: ${cause.message}`;
      }
    } else {
      error = `Could not read MCP settings: ${cause.message}`;
    }
  }

  function status() {
    return {
      enabled: config.enabled,
      running: Boolean(stopServer),
      url: `http://127.0.0.1:${config.port}/mcp`,
      token: config.token,
      error,
    };
  }

  async function start() {
    if (quitting || stopServer || !config.enabled) return;
    try {
      const { startMcpServer } = await import('./generated/mcp-server.mjs');
      if (quitting) return;
      const stop = await startMcpServer({ ...options, port: config.port, token: config.token });
      if (quitting) await stop();
      else {
        stopServer = stop;
        error = null;
      }
    } catch (cause) {
      error =
        cause.code === 'EADDRINUSE'
          ? `Port ${config.port} is already in use. Close the other server and retry.`
          : `Could not start MCP server: ${cause.message}`;
    }
  }

  async function stop() {
    const close = stopServer;
    stopServer = null;
    await close?.();
  }

  function serialize(action) {
    const result = queue.then(async () => {
      if (quitting) throw new Error('Astrofox is closing.');
      try {
        await action();
      } catch (cause) {
        error = cause.message;
      }
      return status();
    });
    queue = result.catch(() => {});
    return result;
  }

  function trusted(event) {
    const contents = getWindow()?.webContents;
    if (!contents || event.sender !== contents || event.senderFrame !== contents.mainFrame) {
      throw new Error('Untrusted MCP settings request.');
    }
  }

  ipcMain.handle('mcp:get-status', async event => {
    trusted(event);
    await queue;
    return status();
  });
  ipcMain.handle('mcp:set-enabled', (event, enabled) => {
    trusted(event);
    if (typeof enabled !== 'boolean') throw new Error('Expected a boolean MCP setting.');
    return serialize(async () => {
      const next = { ...config, enabled };
      await persist(next);
      config = next;
      error = null;
      if (enabled) await start();
      else await stop();
    });
  });
  ipcMain.handle('mcp:reset-token', event => {
    trusted(event);
    return serialize(async () => {
      const next = { ...config, token: randomBytes(32).toString('hex') };
      await persist(next);
      config = next;
      error = null;
      await stop();
      await start();
    });
  });

  return {
    start: () => serialize(start),
    close: () => {
      quitting = true;
      for (const channel of ['mcp:get-status', 'mcp:set-enabled', 'mcp:reset-token'])
        ipcMain.removeHandler(channel);
      return stop();
    },
  };
}
