import type { DesktopBridge } from './channels';

/**
 * The bridge the Electron preload exposes, or null in a browser. Only the
 * platform adapters and `lib/storage`'s desktop backend read it; everything
 * else goes through `platform` (`./index.ts`). Kept free of imports so
 * storage can use it without loading the rest of the platform.
 */
export function getDesktopBridge(): DesktopBridge | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const bridge = window.__ASTROFOX__;

  return bridge?.isDesktop ? bridge : null;
}
