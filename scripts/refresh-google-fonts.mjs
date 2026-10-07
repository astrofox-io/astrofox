import { writeFile } from 'node:fs/promises';

// Snapshot metadata only. Font files are fetched from Google's CSS API at
// runtime. Keeping the catalog here avoids a runtime API key or proxy.
const response = await fetch('https://fonts.google.com/metadata/fonts');
if (!response.ok) throw new Error(`Google Fonts catalog: HTTP ${response.status}`);
const metadata = await response.json();
if (!Array.isArray(metadata.familyMetadataList)) throw new Error('Invalid Google Fonts catalog');
const catalog = Object.fromEntries(
  metadata.familyMetadataList
    .filter(font => font.isOpenSource && font.family && font.fonts)
    .sort((a, b) => a.family.localeCompare(b.family))
    .map(font => [font.family, Object.keys(font.fonts)]),
);
await writeFile(
  new URL('../src/lib/config/googleFonts.json', import.meta.url),
  `${JSON.stringify(catalog, null, 2)}\n`,
);
console.log(`Updated ${Object.keys(catalog).length} Google Fonts families (metadata only).`);
