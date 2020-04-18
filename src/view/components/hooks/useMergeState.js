import { useState, useCallback } from 'react';

export default function useMergeState(defaultState) {
  const [state, setState] = useState(defaultState);

  const callback = useCallback(
    props => {
      if (typeof props === 'function') {
        setState(state => ({ ...state, ...props(state) }));
      } else {
        setState(state => ({ ...state, ...props }));
      }
    },
    [setState],
  );

  return [state, callback];
}
