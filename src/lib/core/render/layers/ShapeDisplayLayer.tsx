import type { BaseDisplayLayerProps } from '../renderTypes';
import { GpuDisplayLayer } from './gpu/GpuDisplayLayer';
import { ShapeRenderer } from './gpu/ShapeRenderer';

const create = () => new ShapeRenderer();

export function ShapeDisplayLayer(props: BaseDisplayLayerProps) {
  return <GpuDisplayLayer {...props} create={create} />;
}
