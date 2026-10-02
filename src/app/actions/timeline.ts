import { projectDocument } from '@/app/document';
import type { LayerJSON } from '@/lib/document/types';
import type { Clip } from '@/lib/timeline/clip';
import type { Tracks } from '@/lib/timeline/tracks';
import { getProjectDuration } from '@/lib/timeline/transport';

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

export interface TimelineElement {
  id: string;
  sceneId: string | null;
  type: 'scene' | 'display' | 'effect';
  name: string;
  displayName: string;
  enabled: boolean;
  clip: Clip | null;
  /** Keyframe tracks by property; empty when nothing is animated. */
  tracks: Tracks;
  hasOpacity: boolean;
}

/** Elements in the same order as the Layers panel, with their clips. */
export function listTimelineElements() {
  const duration = getProjectDuration();
  const elements: TimelineElement[] = [];

  const push = (layer: LayerJSON, sceneId: string | null, type: TimelineElement['type']) =>
    elements.push({
      id: layer.id,
      sceneId,
      type,
      name: layer.name,
      displayName: layer.displayName,
      enabled: layer.enabled,
      clip: layer.clip ?? null,
      tracks: layer.tracks ?? {},
      hasOpacity: typeof layer.properties.opacity === 'number',
    });

  for (const scene of projectDocument.getState().scenes) {
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
