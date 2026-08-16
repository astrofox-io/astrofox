// @ts-nocheck

import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import useApp from '@/app/actions/app';
import useScenes, { getSceneIdForElement } from '@/app/actions/scenes';
import { getDisplayLayerEntry } from './displayLayerRegistry';
import { SceneWithEffects } from './effects';
import { PerspectiveScene3D } from './geometry';

const NEUTRAL_SCENE_PROPS = {
  sceneOpacity: 1,
  sceneBlendMode: 'Normal',
  sceneMask: false,
  sceneInverse: false,
  sceneMaskCombine: 'replace',
};

function wrapDisplayNode(display, node) {
  if (!node) {
    return null;
  }

  return (
    <group key={display.id} visible={Boolean(display.enabled)}>
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
  const sceneById = useScenes(state => state.sceneById);
  const elementParentSceneId = useScenes(state => state.elementParentSceneId);
  const cameraModeSceneId = React.useMemo(
    () =>
      cameraModeEnabled
        ? getSceneIdForElement(activeElementId, sceneById, elementParentSceneId)
        : null,
    [activeElementId, cameraModeEnabled, elementParentSceneId, sceneById],
  );
  let order = 1;
  let sceneOrder = 0;
  const sceneProducers = [];

  for (const scene of scenes || []) {
    if (!scene?.enabled) {
      continue;
    }

    const sceneEffects = (scene.effects || []).filter(e => e?.enabled);
    const depthOfFieldEffect =
      sceneEffects.find(effect => effect?.name === 'DepthOfFieldEffect') || null;
    const postEffects = sceneEffects.filter(effect => effect?.name !== 'DepthOfFieldEffect');
    const scene2D = [];
    const scene3D = [];
    const has3DDisplays = (scene.displays || []).some(
      display => getDisplayLayerEntry(display?.name)?.group === '3d',
    );
    let scene3DOrder = order;

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
        });

        if (node) {
          if (entry.group === '3d') {
            if (scene3D.length === 0) {
              scene3DOrder = order;
            }
            scene3D.push(wrapDisplayNode(display, node));
          } else {
            scene2D.push(wrapDisplayNode(display, node));
          }
        }
      }

      order += 1;
    }

    const displayContent = (
      <React.Fragment key={scene.id}>
        {(has3DDisplays || cameraModeSceneId === scene.id) && (
          <PerspectiveScene3D
            sceneId={scene.id}
            sceneProperties={scene.properties || {}}
            cameraModeActive={cameraModeSceneId === scene.id}
            width={width}
            height={height}
            renderOrder={scene3DOrder}
            depthOfFieldEffect={depthOfFieldEffect}
          >
            {scene3D}
          </PerspectiveScene3D>
        )}
        {scene2D}
      </React.Fragment>
    );

    const currentSceneOrder = sceneOrder;
    sceneOrder += 1;

    sceneProducers.push(
      <SceneWithEffects
        key={scene.id}
        width={width}
        height={height}
        effects={postEffects}
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
