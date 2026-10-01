import type { RenderFrameData } from '@/lib/types';

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
}
