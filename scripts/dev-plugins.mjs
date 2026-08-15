import { createReadStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import getPort from 'get-port';

const host = '127.0.0.1';
const port = await getPort({ host });
const root = fileURLToPath(new URL('../examples/plugins/', import.meta.url));
const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.frag': 'text/plain; charset=utf-8',
  '.gif': 'image/gif',
  '.glsl': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.vert': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

function send(response, status, message) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(message);
}

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', '*');
  response.setHeader('Cache-Control', 'no-store');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    send(response, 405, 'Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', `http://${host}`).pathname);
  } catch {
    send(response, 400, 'Invalid URL');
    return;
  }

  const filePath = resolve(root, pathname.replace(/^\/+/, ''));
  if (filePath !== root && !filePath.startsWith(rootPrefix)) {
    send(response, 403, 'Forbidden');
    return;
  }

  try {
    const file = await stat(filePath);
    if (!file.isFile()) {
      send(response, 404, 'Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Length': file.size,
      'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch {
    send(response, 404, 'Not found');
  }
});

server.on('error', error => {
  console.error(`[plugins] ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, async () => {
  console.log(`[plugins] serving ${root}`);

  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      console.log(
        `[plugins] ${entry.name}: http://${host}:${port}/${entry.name}/astrofox.plugin.json`,
      );
    }
  }
});
