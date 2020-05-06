import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useForceUpdate from 'components/hooks/useForceUpdate';
import useTimeout from 'components/hooks/useTimeout';
import { touchProject } from 'actions/project';

export default function useEntity(entity, touchTimeout = 1000) {
  const dispatch = useDispatch();
  const forceUpdate = useForceUpdate();
  const touch = useTimeout(() => dispatch(touchProject()), touchTimeout);

  return useCallback(
    props => {
      if (entity.update(props)) {
        if (touchTimeout) {
          touch();
        }
        forceUpdate();
      }
    },
    [entity],
  );
}
