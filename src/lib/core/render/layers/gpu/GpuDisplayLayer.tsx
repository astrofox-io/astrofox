import React from 'react';
import type { Object3D } from 'three';
import type { RenderFrameData } from '@/lib/types';
import { toRadians } from '../../constants';
import type { BaseDisplayLayerProps } from '../../renderTypes';

export interface GpuDisplay {
  object: Object3D;
  update(properties: Record<string, unknown>, frame?: RenderFrameData): void;
  dispose(): void;
}

export function GpuDisplayLayer({
  display,
  order,
  frameData,
  create,
}: BaseDisplayLayerProps & { create: () => GpuDisplay }) {
  const renderer = React.useMemo(create, [create]);
  React.useLayoutEffect(() => {
    const props = display.properties || {};
    renderer.update(props, frameData);
    renderer.object.position.set(Number(props.x || 0), -Number(props.y || 0), 0);
    renderer.object.rotation.z = -toRadians(Number(props.rotation || 0));
    renderer.object.renderOrder = order;
  });
  React.useEffect(() => () => renderer.dispose(), [renderer]);
  // Own the materials explicitly: R3F copies uniform descriptors supplied as
  // JSX props, so all animated values are written to the live material instead.
  return <primitive object={renderer.object} dispose={null} />;
}
