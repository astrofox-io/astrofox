// @ts-nocheck

import { useFrame } from '@react-three/fiber';
import React from 'react';
import useApp from '@/app/actions/app';
import useScenes, { getSceneIdForElement } from '@/app/actions/scenes';
import { BLANK_IMAGE } from '@/app/constants';
import { SceneWithEffects } from './effects';
import {
  CubesDisplayLayer3D,
  GeometryDisplayLayer3D,
  MeshGridDisplayLayer3D,
  PerspectiveScene3D,
  TunnelDisplayLayer3D,
} from './geometry';
import {
  BarSpectrumDisplayLayer,
  ImageDisplayLayer,
  RadialSpectrumDisplayLayer,
  ShapeDisplayLayer,
  SoundWaveDisplayLayer,
  TextDisplayLayer,
  VideoDisplayLayer,
  WaveformRingDisplayLayer,
  WaveSpectrumDisplayLayer,
} from './layers';

const NEUTRAL_SCENE_PROPS = {
  sceneOpacity: 1,
  sceneBlendMode: 'Normal',
  sceneMask: false,
  sceneInverse: false,
  sceneMaskCombine: 'replace',
};

const THREE_D_DISPLAY_NAMES = new Set([
  'GeometryDisplay',
  'TunnelDisplay',
  'CubesDisplay',
  'MeshGridDisplay',
]);

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

function ComposerPresenter({ onPresent }) {
  useFrame(state => {
    onPresent?.(state.gl);
  }, 1);

  return null;
}

export default function StageRoot({ width, height, scenes, frameData, sceneLayersRef, onPresent }) {
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
    const has3DDisplays = (scene.displays || []).some(display =>
      THREE_D_DISPLAY_NAMES.has(display?.name),
    );
    let scene3DOrder = order;

    for (const display of scene.displays || []) {
      if (!display) {
        order += 1;
        continue;
      }

      switch (display.name) {
        case 'ImageDisplay': {
          const src = display.properties?.src;
          if (!src || src === BLANK_IMAGE) break;
          scene2D.push(
            wrapDisplayNode(
              display,
              <ImageDisplayLayer display={display} order={order} {...NEUTRAL_SCENE_PROPS} />,
            ),
          );
          break;
        }
        case 'VideoDisplay':
          scene2D.push(
            wrapDisplayNode(
              display,
              <VideoDisplayLayer display={display} order={order} {...NEUTRAL_SCENE_PROPS} />,
            ),
          );
          break;
        case 'TextDisplay':
          scene2D.push(
            wrapDisplayNode(
              display,
              <TextDisplayLayer
                display={display}
                order={order}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'ShapeDisplay':
          scene2D.push(
            wrapDisplayNode(
              display,
              <ShapeDisplayLayer
                display={display}
                order={order}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'BarSpectrumDisplay':
          scene2D.push(
            wrapDisplayNode(
              display,
              <BarSpectrumDisplayLayer
                display={display}
                order={order}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'RadialSpectrumDisplay':
          scene2D.push(
            wrapDisplayNode(
              display,
              <RadialSpectrumDisplayLayer
                display={display}
                order={order}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'WaveSpectrumDisplay':
          scene2D.push(
            wrapDisplayNode(
              display,
              <WaveSpectrumDisplayLayer
                display={display}
                order={order}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'WaveformRingDisplay':
          scene2D.push(
            wrapDisplayNode(
              display,
              <WaveformRingDisplayLayer
                display={display}
                order={order}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'SoundWaveDisplay':
          scene2D.push(
            wrapDisplayNode(
              display,
              <SoundWaveDisplayLayer
                display={display}
                order={order}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'GeometryDisplay':
          if (scene3D.length === 0) scene3DOrder = order;
          scene3D.push(
            wrapDisplayNode(
              display,
              <GeometryDisplayLayer3D
                display={display}
                order={order}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'TunnelDisplay':
          if (scene3D.length === 0) scene3DOrder = order;
          scene3D.push(
            wrapDisplayNode(
              display,
              <TunnelDisplayLayer3D
                display={display}
                order={order}
                height={height}
                sceneProperties={scene.properties || {}}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'CubesDisplay':
          if (scene3D.length === 0) scene3DOrder = order;
          scene3D.push(
            wrapDisplayNode(
              display,
              <CubesDisplayLayer3D
                display={display}
                order={order}
                width={width}
                height={height}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        case 'MeshGridDisplay':
          if (scene3D.length === 0) scene3DOrder = order;
          scene3D.push(
            wrapDisplayNode(
              display,
              <MeshGridDisplayLayer3D
                display={display}
                order={order}
                frameData={frameData}
                {...NEUTRAL_SCENE_PROPS}
              />,
            ),
          );
          break;
        default:
          break;
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
      <ComposerPresenter onPresent={onPresent} />
    </>
  );
}
