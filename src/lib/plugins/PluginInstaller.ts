import { computeIntegrity } from './integrity';
import { parseManifest } from './manifestSchema';
import { saveInstalledPlugin } from './PluginStore';
import type { InstalledPlugin, PluginPackage } from './types';

const MAX_MANIFEST_SIZE = 64 * 1024;
const MAX_TEXT_FILE_SIZE = 1024 * 1024;
const MAX_ICON_SIZE = 256 * 1024;

function isLocalhost(url: URL) {
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
}

function assertAllowedUrl(url: URL) {
  if (url.protocol === 'https:') {
    return;
  }
  if (url.protocol === 'http:' && isLocalhost(url)) {
    return;
  }
  throw new Error(`Plugins can only be fetched over https (got ${url.protocol}//${url.host})`);
}

async function fetchText(url: URL, maxSize: number): Promise<string> {
  const response = await fetch(url.href, {
    credentials: 'omit',
    redirect: 'follow',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url.href} (${response.status})`);
  }

  const text = await response.text();
  if (text.length > maxSize) {
    throw new Error(`${url.href} exceeds the size limit`);
  }

  return text;
}

async function fetchIconAsDataUrl(url: URL): Promise<string> {
  const response = await fetch(url.href, {
    credentials: 'omit',
    redirect: 'follow',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url.href} (${response.status})`);
  }

  const blob = await response.blob();
  if (blob.size > MAX_ICON_SIZE) {
    throw new Error('Plugin icon exceeds the size limit');
  }
  if (!blob.type.startsWith('image/')) {
    throw new Error('Plugin icon is not an image');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read plugin icon'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetches and validates a plugin package from a manifest URL. Does NOT
 * install anything — the caller shows the fetched metadata to the user for
 * consent first, then calls installPluginPackage.
 */
export async function fetchPluginPackage(manifestUrl: string): Promise<PluginPackage> {
  const base = new URL(manifestUrl);
  assertAllowedUrl(base);

  const manifestText = await fetchText(base, MAX_MANIFEST_SIZE);

  let manifestData: unknown;
  try {
    manifestData = JSON.parse(manifestText);
  } catch {
    throw new Error('Plugin manifest is not valid JSON');
  }

  const manifest = parseManifest(manifestData);

  const files: Record<string, string> = {};

  for (const ref of [manifest.shader, manifest.entry]) {
    if (!ref) {
      continue;
    }
    const fileUrl = new URL(ref, base);
    assertAllowedUrl(fileUrl);
    files[ref] = await fetchText(fileUrl, MAX_TEXT_FILE_SIZE);
  }

  if (manifest.icon) {
    try {
      const iconUrl = new URL(manifest.icon, base);
      assertAllowedUrl(iconUrl);
      files[manifest.icon] = await fetchIconAsDataUrl(iconUrl);
    } catch {
      // Icons are cosmetic; a failed icon fetch doesn't block installation.
    }
  }

  const integrity: Record<string, string> = {};
  for (const [ref, content] of Object.entries(files)) {
    integrity[ref] = await computeIntegrity(content);
  }

  return {
    manifest,
    sourceUrl: base.href,
    files,
    integrity,
  };
}

/**
 * Persists a fetched (and user-approved) package. The stored content is
 * what runs from now on — the source URL is only contacted again for
 * explicit updates, and integrity hashes are re-verified on every load.
 */
export function installPluginPackage(pkg: PluginPackage): InstalledPlugin {
  const installed: InstalledPlugin = {
    manifest: pkg.manifest,
    sourceUrl: pkg.sourceUrl,
    installedAt: new Date().toISOString(),
    files: pkg.files,
    integrity: pkg.integrity,
    // localhost installs are development iterations; content is expected to
    // change between reloads, so integrity is not pinned for them.
    dev: isLocalhost(new URL(pkg.sourceUrl)),
  };

  saveInstalledPlugin(installed);

  return installed;
}
