import { randomUUID, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { createServer, type IncomingMessage } from 'node:http';
import path from 'node:path';
import {
  localhostHostValidation,
  NodeStreamableHTTPServerTransport,
} from '@modelcontextprotocol/node';
import { McpServer } from '@modelcontextprotocol/server';
import type { BrowserWindow, IpcMain } from 'electron';
import {
  type AutomationResponse,
  type CommandName,
  commands,
  toolAnnotations,
  toolContent,
} from '../../src/lib/automation/protocol';
import { emit, handle, listen } from '../ipc';

interface Options {
  ipcMain: IpcMain;
  getWindow: () => BrowserWindow | null;
  userDataPath: string;
  version: string;
  port: number;
  token: string;
  onRendererGone?: () => void;
}

const MAX_BODY = 1024 * 1024;
const MAX_FILE = 256 * 1024 * 1024;

async function readBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('Request exceeds 1 MiB.');
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function absolutePath(value: unknown) {
  if (typeof value !== 'string' || !path.isAbsolute(value) || value.includes('\0')) {
    throw new Error('An absolute local filesystem path is required.');
  }
  // Do not allow Windows device paths or alternate data streams.
  if (process.platform === 'win32' && (/^\\\\[?.]\\/.test(value) || value.slice(2).includes(':'))) {
    throw new Error('Device paths and alternate data streams are not supported.');
  }
  return path.normalize(value);
}

export async function startMcpServer({
  ipcMain,
  getWindow,
  userDataPath,
  version,
  port,
  token,
  onRendererGone,
}: Options) {
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid ASTROFOX_MCP_PORT.');
  if (!/^[!-~]{32,256}$/.test(token))
    throw new Error('ASTROFOX_MCP_TOKEN must contain 32–256 printable non-space ASCII characters.');
  const expectedAuthorization = Buffer.from(`Bearer ${token}`);
  const url = `http://127.0.0.1:${port}/mcp`;
  let ready = false;
  let pending: {
    id: string;
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;
  let poisoned = false;
  let closed = false;
  let contents: BrowserWindow['webContents'] | undefined;

  function reset(reason: string) {
    ready = false;
    poisoned = false;
    if (pending) {
      clearTimeout(pending.timer);
      pending.reject(new Error(reason));
      pending = null;
    }
  }
  // Only the app window's main frame is heard (electron/ipc.ts).
  const stopListening = listen(ipcMain, getWindow, {
    'mcp:ready': () => {
      watchWindow();
      ready = true;
    },
    'mcp:not-ready': () => reset('Astrofox editor is reconnecting.'),
    'mcp:response': (response: AutomationResponse) => {
      if (!pending || response?.id !== pending.id) return;
      clearTimeout(pending.timer);
      const current = pending;
      pending = null;
      if (response.error) current.reject(new Error(response.error));
      else current.resolve(response.result);
    },
  });
  const onNavigate = () => {
    reset('Astrofox renderer reloaded; retry after it is ready.');
    onRendererGone?.();
  };
  const onGone = () => {
    reset('Astrofox renderer disconnected.');
    onRendererGone?.();
  };
  function unwatchWindow() {
    contents?.removeListener('did-start-loading', onNavigate);
    contents?.removeListener('render-process-gone', onGone);
    contents?.removeListener('destroyed', onGone);
  }
  function watchWindow() {
    const next = getWindow()?.webContents;
    if (contents === next) return;
    unwatchWindow();
    contents = next;
    contents?.on('did-start-loading', onNavigate);
    contents?.on('render-process-gone', onGone);
    contents?.on('destroyed', onGone);
  }
  watchWindow();

  function requireOpen() {
    if (closed) throw new Error('The MCP server has stopped.');
  }
  const removeHandlers = handle(ipcMain, getWindow, {
    'mcp:read-file': async input => {
      requireOpen();
      const target = absolutePath(input);
      const file = await fs.open(target, 'r');
      try {
        const stat = await file.stat();
        if (!stat.isFile() || stat.size > MAX_FILE)
          throw new Error('Media/project must be a file of at most 256 MiB.');
        return { name: path.basename(target), data: await file.readFile() };
      } finally {
        await file.close();
      }
    },
    'mcp:write-project': async input => {
      requireOpen();
      const target = absolutePath(input.path);
      if (path.extname(target).toLowerCase() !== '.afx')
        throw new Error('Save projects with the .afx extension.');
      if (typeof input.text !== 'string' || Buffer.byteLength(input.text) > MAX_FILE)
        throw new Error('Project is too large.');
      await fs.writeFile(target, input.text, { flag: input.overwrite === true ? 'w' : 'wx' });
      return { path: target };
    },
    'mcp:check-output': async input => {
      requireOpen();
      const target = absolutePath(input.path);
      if (!['.mp4', '.webm'].includes(path.extname(target).toLowerCase()))
        throw new Error('Expected an .mp4 or .webm output.');
      const directory = await fs.stat(path.dirname(target));
      if (!directory.isDirectory()) throw new Error('Output directory does not exist.');
      try {
        const stat = await fs.lstat(target);
        if (!stat.isFile() || stat.isSymbolicLink())
          throw new Error('Output must be a regular file.');
        if (input.overwrite !== true)
          throw new Error('Output already exists; set overwrite=true to replace it.');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
      return { path: target };
    },
  });

  async function dispatch(command: CommandName, args: unknown) {
    if (!ready || !getWindow() || getWindow()?.isDestroyed())
      throw new Error('Astrofox is not ready. Open the desktop editor and retry.');
    if (poisoned)
      throw new Error(
        'A command timed out. Reload the editor before sending more commands; the previous operation may have completed.',
      );
    if (pending) throw new Error('Another Astrofox command is running. Retry when it completes.');
    const id = randomUUID();
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        pending = null;
        poisoned = true;
        reject(
          new Error(
            'Astrofox command timed out; its outcome is unknown. Reload and inspect before retrying.',
          ),
        );
      }, 60_000);
      pending = { id, resolve, reject, timer };
      try {
        emit(getWindow(), 'mcp:command', {
          id,
          command,
          args,
          deadline: Date.now() + 60_000,
        });
      } catch (error) {
        clearTimeout(timer);
        pending = null;
        reject(error);
      }
    });
  }

  const validateHost = localhostHostValidation();
  const activeServers = new Set<McpServer>();
  const http = createServer(async (request, response) => {
    if (request.url !== '/mcp') {
      response.writeHead(404).end();
      return;
    }
    if (!validateHost(request, response)) return;
    // This endpoint is for local MCP clients, not arbitrary browser pages.
    if (request.headers.origin && request.headers.origin !== new URL(url).origin) {
      response.writeHead(403).end();
      return;
    }
    const authorization = Buffer.from(request.headers.authorization || '');
    if (
      authorization.length !== expectedAuthorization.length ||
      !timingSafeEqual(authorization, expectedAuthorization)
    ) {
      response.writeHead(401).end('Bearer token required.');
      return;
    }
    if (request.method !== 'POST') {
      response.writeHead(405, { Allow: 'POST' }).end();
      return;
    }
    if (!request.headers['content-type']?.startsWith('application/json')) {
      response.writeHead(415).end();
      return;
    }
    if (activeServers.size >= 16) {
      response.writeHead(429).end();
      return;
    }
    const server = new McpServer({ name: 'astrofox', version });
    activeServers.add(server);
    const transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    response.on('close', () => {
      activeServers.delete(server);
      void server.close();
    });
    try {
      for (const name of Object.keys(commands) as CommandName[]) {
        const definition = commands[name];
        server.registerTool(
          name,
          {
            description: definition.description,
            inputSchema: definition.schema,
            annotations: toolAnnotations(name),
          },
          async (args: unknown) => {
            try {
              return { content: toolContent(name, await dispatch(name, args)) };
            } catch (error) {
              return {
                isError: true,
                content: [
                  {
                    type: 'text' as const,
                    text: error instanceof Error ? error.message : String(error),
                  },
                ],
              };
            }
          },
        );
      }
      await server.connect(transport);
      await transport.handleRequest(request, response, await readBody(request));
    } catch (error) {
      if (!response.headersSent)
        response.writeHead(400).end(error instanceof Error ? error.message : 'Invalid request.');
      else response.end();
    }
  });
  http.requestTimeout = 65_000;
  http.headersTimeout = 10_000;
  const configPath = path.join(userDataPath, 'mcp.json');
  let closing: Promise<void> | undefined;
  const close = () => {
    if (closing) return closing;
    closed = true;
    reset('Astrofox MCP stopped.');
    closing = new Promise<void>(resolve => {
      http.close(() => resolve());
      http.closeAllConnections();
    });
    for (const server of activeServers) void server.close();
    stopListening();
    removeHandlers();
    unwatchWindow();
    return closing;
  };
  try {
    await new Promise<void>((resolve, reject) => {
      http.once('error', reject);
      http.listen(port, '127.0.0.1', resolve);
    });
    await fs.mkdir(userDataPath, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify({ url, token }, null, 2), { mode: 0o600 });
    // Renderer may have initialized before the server finished loading.
    emit(getWindow(), 'mcp:probe');
    console.info(`[mcp] Listening at ${url}; connection credentials: ${configPath}`);
    return close;
  } catch (error) {
    await close();
    throw error;
  }
}
