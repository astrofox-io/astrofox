import type { BaseDisplayLayerProps } from '../renderTypes';
import { GpuDisplayLayer } from './gpu/GpuDisplayLayer';
import { PathRenderer } from './gpu/PathRenderer';

const create = () => new PathRenderer('spectrum');

export function WaveSpectrumDisplayLayer(props: BaseDisplayLayerProps) {
  return <GpuDisplayLayer {...props} create={create} />;
}
