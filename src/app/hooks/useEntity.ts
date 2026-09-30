import { useCallback } from 'react';
import { projectDocument } from '@/app/document';
import useForceUpdate from '@/app/hooks/useForceUpdate';
import type Entity from '@/lib/core/Entity';

/**
 * Change handler for a layer's or reactor's control inputs. Edits go through
 * the document, so they are published, undoable and mark the project modified.
 */
export default function useEntity(entity: Entity | null) {
  const forceUpdate = useForceUpdate();

  return useCallback(
    (properties: Record<string, unknown>) => {
      if (!entity) {
        return;
      }

      const { changed } = projectDocument.apply({
        type: 'setProperties',
        id: entity.id,
        properties,
      });

      if (changed) {
        forceUpdate();
      }
    },
    [entity],
  );
}
