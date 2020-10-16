import { fileExists, readFileCompressed, writeFileCompressed } from 'utils/io';
import { getGlobal } from './ipc';

export async function loadConfig() {
  const { APP_CONFIG_FILE } = await getGlobal('env');

  if (fileExists(APP_CONFIG_FILE)) {
    const data = await readFileCompressed(APP_CONFIG_FILE);
    return JSON.parse(data);
  }

  return null;
}

export async function saveConfig(config) {
  const { APP_CONFIG_FILE } = await getGlobal('env');

  const data = JSON.stringify(config);

  await writeFileCompressed(APP_CONFIG_FILE, data);
}
