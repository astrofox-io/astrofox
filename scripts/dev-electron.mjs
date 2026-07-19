import concurrently from 'concurrently';
import getPort from 'get-port';

const host = '127.0.0.1';
const port = await getPort({ host });
const url = `http://${host}:${port}`;
const env = {
  ...process.env,
  PORT: String(port),
  ELECTRON_DEV: '1',
  ELECTRON_START_URL: url,
  NEXT_DEV_DIST_DIR: '.next-desktop',
};

console.log(`[desktop] using ${url}`);

try {
  const { result } = concurrently(
    [
      {
        command: `next dev --turbo --hostname ${host} --port ${port}`,
        name: 'web',
        env,
      },
      {
        command: `wait-on --timeout 180000 ${url} && electron .`,
        name: 'electron',
        env,
      },
    ],
    {
      killOthersOn: ['failure', 'success'],
      prefix: 'name',
      prefixColors: ['cyan', 'magenta'],
      successCondition: 'command-electron',
    },
  );

  await result;
} catch {
  process.exitCode = 1;
}
