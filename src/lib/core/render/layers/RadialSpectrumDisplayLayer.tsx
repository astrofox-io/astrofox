import type { BaseDisplayLayerProps } from '../renderTypes';
import { GpuDisplayLayer } from './gpu/GpuDisplayLayer';
import { RadialRenderer } from './gpu/RadialRenderer';

const create = () => new RadialRenderer();

export function RadialSpectrumDisplayLayer(props: BaseDisplayLayerProps) {
  return <GpuDisplayLayer {...props} create={create} />;
}
