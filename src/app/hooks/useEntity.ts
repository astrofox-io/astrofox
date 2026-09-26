import { useCallback } from 'react';
import { touchProject } from '@/app/actions/project';
import { loadReactors } from '@/app/actions/reactors';
import { updateElementProperties } from '@/app/actions/scenes';
import { renderer } from '@/app/global';
import useForceUpdate from '@/app/hooks/useForceUpdate';
import useTimeout from '@/app/hooks/useTimeout';
import Display from '@/lib/core/Display';
import type Entity from '@/lib/core/Entity';

export default function useEntity(entity: Entity | null, touchTimeout = 1000) {
  const forceUpdate = useForceUpdate();
  const touch = useTimeout(() => touchProject(), touchTimeout);

  return useCallback(
    (props: Record<string, unknown>) => {
      if (entity?.update(props)) {
        // Keep authored values in the editor store; render-time reactor output
        // must not become an undo entry.
        if (entity instanceof Display) {
          updateElementProperties(
            entity.id,
            Object.fromEntries(
              Object.keys(props).map(key => [key, structuredClone(entity.properties[key])]),
            ),
          );
        } else {
          loadReactors();
        }
        if (touchTimeout) {
          touch();
        }
        renderer.requestRender();
        forceUpdate();
      }
    },
    [entity],
  );
}
