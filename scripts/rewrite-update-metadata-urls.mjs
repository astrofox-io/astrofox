import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function getFeedUrl() {
  const rawUrl = process.env.ASTROFOX_UPDATE_FEED_URL?.trim();

  if (!rawUrl) {
    throw new Error('Missing ASTROFOX_UPDATE_FEED_URL. Set it to the public R2 releases URL.');
  }

  return rawUrl.replace(/\/+$/, '');
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function rewriteMetadataFile(filePath, feedUrl) {
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  const rewritten = lines.map(line => {
    const match = line.match(/^(\s*(?:-\s*)?(?:path|url):\s*)(.+?)\s*$/);
    if (!match) {
      return line;
    }

    const value = parseScalar(match[2]);
    if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) {
      return line;
    }

    return `${match[1]}${quote(`${feedUrl}/${path.basename(value)}`)}`;
  });

  writeFileSync(filePath, rewritten.join('\n'), 'utf8');
}

const [, , ...filePaths] = process.argv;
if (filePaths.length === 0) {
  throw new Error('Usage: node scripts/rewrite-update-metadata-urls.mjs <latest*.yml...>');
}

const feedUrl = getFeedUrl();
for (const filePath of filePaths) {
  rewriteMetadataFile(filePath, feedUrl);
}
