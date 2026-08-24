import { readFileSync, writeFileSync } from 'node:fs';

function parseScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
}

function parseLatestMac(filePath) {
  const result = { files: [] };
  let currentFile = null;

  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;

    const fileMatch = line.match(/^ {2}- ([^:]+):\s*(.*)$/);
    if (fileMatch) {
      currentFile = { [fileMatch[1]]: parseScalar(fileMatch[2]) };
      result.files.push(currentFile);
      continue;
    }

    const nestedMatch = line.match(/^ {4}([^:]+):\s*(.*)$/);
    if (nestedMatch && currentFile) {
      currentFile[nestedMatch[1]] = parseScalar(nestedMatch[2]);
      continue;
    }

    const topLevelMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (topLevelMatch) {
      currentFile = null;
      if (topLevelMatch[1] !== 'files') {
        result[topLevelMatch[1]] = parseScalar(topLevelMatch[2]);
      }
    }
  }

  return result;
}

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const [, , outputPath, ...inputPaths] = process.argv;
if (!outputPath || inputPaths.length === 0) {
  throw new Error('Usage: node scripts/merge-latest-mac-metadata.mjs <output> <latest-mac.yml...>');
}

const metadata = inputPaths.map(parseLatestMac);
const files = metadata
  .flatMap(item => item.files ?? [])
  .filter(file => typeof file.url === 'string' && file.url.trim())
  .sort((left, right) => {
    const leftIsZip = left.url.endsWith('.zip') ? 0 : 1;
    const rightIsZip = right.url.endsWith('.zip') ? 0 : 1;
    return leftIsZip - rightIsZip || left.url.localeCompare(right.url);
  });

const primary = files.find(file => file.url.endsWith('.zip')) ?? files[0];
if (!primary) {
  throw new Error('No files found in macOS update metadata.');
}

const version = metadata.find(item => item.version)?.version;
const releaseDate = metadata.find(item => item.releaseDate)?.releaseDate;
if (!version) {
  throw new Error('No version found in macOS update metadata.');
}

const lines = [`version: ${version}`, 'files:'];
for (const file of files) {
  lines.push(`  - url: ${file.url}`);
  for (const key of ['sha512', 'size', 'blockMapSize']) {
    if (file[key] !== undefined) {
      lines.push(`    ${key}: ${file[key]}`);
    }
  }
}
lines.push(`path: ${primary.url}`);
lines.push(`sha512: ${primary.sha512}`);
if (releaseDate) {
  lines.push(`releaseDate: ${quote(releaseDate)}`);
}
lines.push('');

writeFileSync(outputPath, lines.join('\n'));
