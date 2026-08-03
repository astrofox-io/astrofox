import type { RenderFrameData } from '@/lib/types';

export type SceneMaskCombine = 'replace' | 'add';

export interface RenderDisplay<P extends Record<string, unknown> = Record<string, unknown>> {
  id?: string;
  name?: string;
  enabled?: boolean;
  properties?: P;
}

export interface BaseDisplayLayerProps<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  display: RenderDisplay<P>;
  order: number;
  frameData?: RenderFrameData;
  sceneOpacity?: number;
  sceneBlendMode?: string;
  sceneMask?: boolean;
  sceneInverse?: boolean;
  sceneMaskCombine?: SceneMaskCombine;
}
