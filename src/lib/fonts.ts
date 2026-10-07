import { create } from 'zustand';
import { normalizeFontName, resolveCanvasFontFamily } from '@/app/fontFamilies';
import { platform } from '@/lib/platform';

type FontCatalog = Record<string, string[]>;
export const useFonts = create<{ families: string[] }>(() => ({ families: ['Inter'] }));
let catalog: FontCatalog = {};
let initialization: Promise<void> | undefined;
const stylesheets = new Map<string, Promise<void>>();
const readyStylesheets = new Set<string>();

export function initializeFonts() {
  initialization ??= (async () => {
    if (platform.fonts) {
      const families = await platform.fonts.list();
      useFonts.setState({
        families: [...new Set(['Inter', ...families])].sort((a, b) => a.localeCompare(b)),
      });
    } else {
      catalog = (await import('@/lib/config/googleFonts.json')).default;
      useFonts.setState({ families: Object.keys(catalog) });
    }
  })().catch(error => {
    initialization = undefined;
    console.warn('Unable to load font catalog:', error);
  });
  return initialization;
}

export function hasFontStylesheet(fontName: string) {
  const name = normalizeFontName(fontName);
  return platform.isDesktop || name === 'Inter' || readyStylesheets.has(name);
}

async function loadStylesheet(fontName: string) {
  if (hasFontStylesheet(fontName)) return;
  await initializeFonts();
  let pending = stylesheets.get(fontName);
  if (!pending) {
    // Include real regular/bold/italic faces where provided. For families
    // without those faces Chromium synthesizes styles from the nearest face.
    const variants = catalog[fontName];
    if (!variants) return;
    const wanted = variants.filter(variant => ['400', '700', '400i', '700i'].includes(variant));
    const selected = wanted.length ? wanted : [variants[0]];
    const tuples = selected
      .map(variant => `${variant.endsWith('i') ? 1 : 0},${parseInt(variant, 10)}`)
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    const url = new URL('https://fonts.googleapis.com/css2');
    url.searchParams.set('family', `${fontName}:ital,wght@${tuples.join(';')}`);
    url.searchParams.set('display', 'swap');
    pending = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url.href;
      const timeout = window.setTimeout(() => {
        link.remove();
        reject(new Error(`Timed out loading font: ${fontName}`));
      }, 15_000);
      link.onload = () => {
        clearTimeout(timeout);
        readyStylesheets.add(fontName);
        resolve();
      };
      link.onerror = () => {
        clearTimeout(timeout);
        link.remove();
        reject(new Error(`Unable to load font: ${fontName}`));
      };
      document.head.appendChild(link);
    });
    stylesheets.set(fontName, pending);
    // Keep failures cached to avoid issuing a request on every render. A
    // later selection/edit can retry after the connection has recovered.
    void pending.catch(() => {
      window.setTimeout(() => stylesheets.delete(fontName), 30_000);
    });
  }
  await pending;
}

export async function loadTextFont(properties: Record<string, unknown>, pixelRatio = 1) {
  const name = normalizeFontName(String(properties.font || 'Inter'));
  await loadStylesheet(name);
  const font = [
    properties.italic ? 'italic' : 'normal',
    properties.bold ? 'bold' : 'normal',
    `${Number(properties.size || 40) * pixelRatio}px`,
    resolveCanvasFontFamily(name),
  ].join(' ');
  await document.fonts.load(font, String(properties.text || ' '));
}

/** Load text in every scene, including clips that haven't mounted yet. */
export async function loadStageFonts(stage: {
  scenes: Iterable<{ displays: Iterable<{ name: string; properties: Record<string, unknown> }> }>;
}) {
  const pending: Promise<void>[] = [];
  for (const scene of stage.scenes) {
    for (const display of scene.displays) {
      if (display.name === 'TextDisplay') pending.push(loadTextFont(display.properties));
    }
  }
  await Promise.all(pending);
}
