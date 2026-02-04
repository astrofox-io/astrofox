import { api } from 'global';
import { useEffect, useCallback, useState } from 'react';

export default function useWindowState() {
  const [state, setState] = useState({});

  const updateState = useCallback(
    newState => {
      setState(newState);
    },
    [api],
  );

  useEffect(() => {
    api.on('window-state-changed', updateState);

    return () => {
      api.off('window-state-changed', updateState);
    };
  }, [api]);

  return state;
}
