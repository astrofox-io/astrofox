import env from '@/app/env';
import { getDesktopBridge } from './bridge';
import { createDesktopPlatform } from './desktop';
import type { Platform } from './types';
import { createWebPlatform } from './web';

export type * from './types';

/**
 * The platform for this session, chosen once: the Electron app when its
 * preload exposed the bridge, the browser otherwise (including prerendering,
 * where there is no window).
 */
function choosePlatform(): Platform {
  const bridge = getDesktopBridge();

  return bridge ? createDesktopPlatform(bridge, env) : createWebPlatform(env);
}

export const platform: Platform = choosePlatform();

export default platform;
