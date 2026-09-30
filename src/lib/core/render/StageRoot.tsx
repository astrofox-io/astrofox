// @ts-nocheck

import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import useApp from '@/app/actions/app';
import { isVisibleAt } from '@/lib/timeline/clip';
import { getDisplayLayerEntry } from './displayLayerRegistry';
import { SceneWithEffects } from './effects';

const NEUTRAL_SCENE_PROPS = {
  sceneOpacity: 1,
  sceneBlendMode: 'Normal',
  sceneMask: false,
  sceneInverse: false,
  sceneMaskCombine: 'replace',
};

function wrapDisplayNode(display, node, frameData) {
  if (!node) {
    return null;
  }

  return (
    <group
      key={display.id}
      visible={isVisibleAt(display, frameData?.time ?? 0, frameData?.duration)}
    >
      {node}
    </group>
  );
}

function ComposerPresenter({ frameIndex, onPresent }) {
  const invalidate = useThree(state => state.invalidate);

  useFrame(state => {
    onPresent?.(state.gl, frameIndex);
  }, 1);

  // root.render() is asynchronous, so the frame requested by the backend may
  // run before React commits the new frameIndex. Request another frame once
  // the commit lands so presentFrame always sees the latest index (required
  // for waitForPresentation during export).
  React.useLayoutEffect(() => {
    invalidate();
  }, [frameIndex, invalidate]);

  // Layers that apply properties in passive effects (three.js objects mutated
  // in useEffect) commit after the layout-phase frame request; request one
  // more frame once passive effects have flushed so nothing renders one
  // change behind.
  React.useEffect(() => {
    invalidate();
  }, [frameIndex, invalidate]);

  return null;
}

export default function StageRoot({
  width,
  height,
  scenes,
  frameData,
  frameIndex,
  sceneLayersRef,
  onPresent,
}) {
  const activeElementId = useApp(state => state.activeElementId);
  const cameraModeEnabled = useApp(state => state.cameraModeEnabled);
  // Camera mode orbits the camera of the selected display (if it has one).
  const cameraModeDisplayId = cameraModeEnabled ? activeElementId : null;
  let order = 1;
  let sceneOrder = 0;
  const sceneProducers = [];

  for (const scene of scenes || []) {
    if (!isVisibleAt(scene, frameData?.time ?? 0, frameData?.duration)) {
      continue;
    }

    const sceneEffects = (scene.effects || []).filter(effect =>
      isVisibleAt(effect, frameData?.time ?? 0, frameData?.duration),
    );
    const sceneLayers = [];

    for (const display of scene.displays || []) {
      if (!display) {
        order += 1;
        continue;
      }

      const entry = getDisplayLayerEntry(display.name);

      if (entry) {
        const node = entry.render({
          display,
          order,
          frameData,
          width,
          height,
          scene,
          sceneProps: NEUTRAL_SCENE_PROPS,
          cameraModeActive: entry.camera === true && cameraModeDisplayId === display.id,
        });

        if (node) {
          sceneLayers.push(wrapDisplayNode(display, node, frameData));
        }
      }

      order += 1;
    }

    const displayContent = <React.Fragment key={scene.id}>{sceneLayers}</React.Fragment>;

    const currentSceneOrder = sceneOrder;
    sceneOrder += 1;

    sceneProducers.push(
      <SceneWithEffects
        key={scene.id}
        width={width}
        height={height}
        effects={sceneEffects}
        frameData={frameData}
        outputToScreen={false}
        onTexture={texture => {
          if (!texture) {
            sceneLayersRef.current.delete(scene.id);
            return;
          }

          sceneLayersRef.current.set(scene.id, {
            order: currentSceneOrder,
            properties: scene.properties || {},
            texture,
          });
        }}
      >
        {displayContent}
      </SceneWithEffects>,
    );
  }

  return (
    <>
      {sceneProducers}
      <ComposerPresenter frameIndex={frameIndex} onPresent={onPresent} />
    </>
  );
}
