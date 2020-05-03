import { useCallback } from 'react';
import useForceUpdate from 'components/hooks/useForceUpdate';

export default function useEntity(entity) {
  const forceUpdate = useForceUpdate();

  return useCallback(
    props => {
      if (entity.update(props)) {
        forceUpdate();
      }
    },
    [entity],
  );
}
