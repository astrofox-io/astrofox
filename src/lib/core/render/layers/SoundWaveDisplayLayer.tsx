import type { BaseDisplayLayerProps } from '../renderTypes';
import { GpuDisplayLayer } from './gpu/GpuDisplayLayer';
import { PathRenderer } from './gpu/PathRenderer';

const create = () => new PathRenderer('sound');

export function SoundWaveDisplayLayer(props: BaseDisplayLayerProps) {
  return <GpuDisplayLayer {...props} create={create} />;
}
