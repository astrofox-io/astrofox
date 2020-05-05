import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useForceUpdate from 'components/hooks/useForceUpdate';
import { touchProject } from 'actions/project';

export default function useEntity(entity, updateProject = true) {
  const dispatch = useDispatch();
  const forceUpdate = useForceUpdate();

  return useCallback(
    props => {
      if (entity.update(props)) {
        if (updateProject) {
          dispatch(touchProject());
        }
        forceUpdate();
      }
    },
    [entity],
  );
}
