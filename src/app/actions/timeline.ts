import { stage } from '@/app/global';
import Display from '@/lib/core/Display';
import { type Clip, type ClipPatch, mergeClip } from '@/lib/timeline/clip';
import {
  getProjectDuration,
  setProjectDuration as setTransportDuration,
  setProjectFps as setTransportFps,
  type TimelineFps,
} from '@/lib/timeline/transport';
import { touchProject } from './project';
import { loadScenes } from './scenes';

export {
  getProjectDuration,
  getProjectFps,
  getTransportState,
  pauseTransport,
  playTransport,
  seekTransport,
  stepTransport,
  stopTransport,
  toggleTransport,
} from '@/lib/timeline/transport';

function findDisplay(id: string): Display | null {
  const element = stage.getStageElementById(id);
  return element instanceof Display ? element : null;
}

/**
 * Merge a clip patch into an element's clip. Goes through `loadScenes()` so
 * the scene store, undo history and the renderer all pick it up.
 */
export function setElementClip(id: string, patch: ClipPatch): Clip | null {
  const element = findDisplay(id);

  if (!element) {
    return null;
  }

  const next = mergeClip(element.clip, patch);

  if (JSON.stringify(next) === JSON.stringify(element.clip)) {
    return element.clip;
  }

  element.setClip(next);
  loadScenes();

  return element.clip;
}

/** Remove an element's clip so it is active for the whole project. */
export function clearElementClip(id: string) {
  const element = findDisplay(id);

  if (!element?.clip) {
    return;
  }

  element.setClip(null);
  loadScenes();
}

export function setProjectDuration(duration: number | null) {
  setTransportDuration(duration);
  touchProject();
}

export function setProjectFps(fps: TimelineFps) {
  setTransportFps(fps);
  touchProject();
}

/** Elements in the same order as the Layers panel, with their clips. */
export function listTimelineElements() {
  const duration = getProjectDuration();
  const elements: {
    id: string;
    sceneId: string | null;
    type: 'scene' | 'display' | 'effect';
    name: string;
    displayName: string;
    enabled: boolean;
    clip: Clip | null;
    hasOpacity: boolean;
  }[] = [];

  const push = (element: Display, sceneId: string | null, type: 'scene' | 'display' | 'effect') =>
    elements.push({
      id: element.id,
      sceneId,
      type,
      name: element.name,
      displayName: element.displayName,
      enabled: element.enabled,
      clip: element.clip,
      hasOpacity: typeof element.authoredProperties.opacity === 'number',
    });

  for (const scene of stage.scenes as unknown as (Display & {
    displays: Display[];
    effects: Display[];
  })[]) {
    push(scene, null, 'scene');

    for (const effect of scene.effects) {
      push(effect, scene.id, 'effect');
    }

    for (const display of scene.displays) {
      push(display, scene.id, 'display');
    }
  }

  return { duration, elements };
}
