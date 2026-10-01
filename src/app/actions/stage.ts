import { create } from 'zustand';
import { DEFAULT_ZOOM } from '@/app/constants';
import { projectDocument } from '@/app/document';
import { renderBackend, renderer } from '@/app/global';
import { media } from '@/app/media';
import { t } from '@/i18n/config';
import ImageDisplay from '@/lib/displays/ImageDisplay';
import type { DocumentOp } from '@/lib/document/types';
import { clamp } from '@/lib/utils/math';
import { raiseError } from './error';

/** How the stage is viewed. Canvas size and color are document content (`projectDocument`). */
interface StageState {
  zoom: number;
  loading: boolean;
}

const initialState: StageState = {
  zoom: DEFAULT_ZOOM,
  loading: false,
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

const stageStore = create(() => ({
  ...initialState,
}));

export async function loadStageImage(file: File) {
  try {
    const image = await media.load({ file }, 'image');
    const { scenes } = projectDocument.getState();
    const ops: DocumentOp[] = [];
    let target: { id: string; property: string } | undefined;

    for (const scene of scenes) {
      for (const layer of [scene, ...scene.displays, ...scene.effects]) {
        const display = projectDocument.findLayer(layer.id);
        const config = (
          display?.constructor as { config?: { controls?: Record<string, { type?: string }> } }
        )?.config;
        const property = Object.keys(config?.controls ?? {}).find(
          key => config?.controls?.[key].type === 'image',
        );
        if (property) {
          target = { id: layer.id, property };
          break;
        }
      }
      if (target) break;
    }

    if (!target) {
      const display = new ImageDisplay();
      if (scenes.length === 0) ops.push({ type: 'addScene' });
      ops.push({ type: 'addElement', element: display });
      target = { id: display.id, property: 'src' };
    }

    ops.push({
      type: 'setProperties',
      id: target.id,
      properties: { [target.property]: image.element, sourcePath: image.sourcePath },
    });
    projectDocument.apply(ops);
  } catch (error) {
    raiseError(t('errors.invalid-image-file'), error);
  }
}

export function updateStage(props: Partial<StageState>) {
  stageStore.setState(props as StageState);

  renderBackend.update(props);
  renderer.requestRender();
}

export function setZoom(value: number) {
  const nextValue = Number(value);

  if (!Number.isFinite(nextValue)) {
    return;
  }

  updateStage({ zoom: clamp(nextValue, MIN_ZOOM, MAX_ZOOM) });
}

export function zoomIn() {
  const { zoom } = stageStore.getState();

  const newValue = clamp(zoom + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);

  updateStage({ zoom: newValue });
}

export function zoomOut() {
  const { zoom } = stageStore.getState();

  const newValue = clamp(zoom - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);

  updateStage({ zoom: newValue });
}

export function fitToScreen() {
  const viewport = document.getElementById('viewport');

  if (!viewport) {
    return;
  }

  const { width, height } = projectDocument.getState().canvas;

  const newWidth = clamp((viewport.clientWidth * 0.8) / width, MIN_ZOOM, MAX_ZOOM);
  const newHeight = clamp((viewport.clientHeight * 0.8) / height, MIN_ZOOM, MAX_ZOOM);

  updateStage({ zoom: Math.min(newWidth, newHeight) });
}

export default stageStore;
