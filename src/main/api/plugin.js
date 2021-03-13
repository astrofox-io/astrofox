import fs from 'fs';
import path from 'path';
import yauzl from 'yauzl';

const plugins = {};

function initPlugin(id) {
  if (!plugins[id]) {
    plugins[id] = {};
  }
}

function getPluginId(file) {
  return path.parse(file).base;
}

function streamToBuffer(stream) {
  const chunks = [];

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function loadModule(id, data) {
  initPlugin(id);

  const blob = new Blob([data], { type: 'text/javascript' });

  plugins[id].src = URL.createObjectURL(blob);
}

function loadIcon(id, data) {
  initPlugin(id);

  const blob = new Blob([Uint8Array.from(data).buffer], { type: 'image/png' });

  plugins[id].icon = URL.createObjectURL(blob);
}

function loadPluginFile(dir, file) {
  const id = getPluginId(dir);
  const filename = path.join(dir, file);

  if (!plugins[id]) {
    plugins[id] = {};
  }

  if (file === 'index.js') {
    const plugin = fs.readFileSync(filename, 'utf-8');
    loadModule(id, plugin);
  } else if (file === 'icon.png') {
    const icon = fs.readFileSync(filename);
    loadIcon(id, icon);
  }
}

async function loadZipFile(file) {
  return new Promise((resolve, reject) => {
    const id = getPluginId(file.replace('.zip', ''));

    yauzl.open(file, { lazyEntries: true }, (err, zip) => {
      if (err) {
        reject(err);
      }

      zip.readEntry();

      zip.on('entry', entry => {
        if (!/\/$/.test(entry.fileName)) {
          zip.openReadStream(entry, async (err, readStream) => {
            if (err) {
              reject(err);
            }
            readStream.on('end', () => {
              zip.readEntry();
            });

            const data = await streamToBuffer(readStream);

            if (entry.fileName === 'index.js') {
              loadModule(id, data.toString('utf-8'));
            } else if (entry.fileName === 'icon.png') {
              loadIcon(id, data);
            }
          });
        }
      });
      zip.on('end', resolve);
    });
  });
}

async function loadDirectory(dir) {
  const files = fs.readdirSync(dir);
  const promises = [];

  for (const file of files) {
    promises.push(loadPluginFile(dir, file));
  }

  await Promise.all(promises);
}

export async function loadPlugins(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);
  const promises = [];

  for (const file of files) {
    const filename = path.join(dir, file);

    if (file.endsWith('.zip')) {
      promises.push(loadZipFile(filename));
    } else if (fs.statSync(filename).isDirectory()) {
      promises.push(loadDirectory(filename));
    }
  }

  await Promise.all(promises);

  return plugins;
}

export function getPlugins() {
  return plugins;
}
