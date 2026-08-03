import { useCallback, useEffect, useState } from 'react';

interface WindowState {
  focused: boolean;
}

export default function useWindowState() {
  const [state, setState] = useState<WindowState>({ focused: true });

  const updateState = useCallback(() => {
    setState({
      focused: document.hasFocus(),
    });
  }, []);

  useEffect(() => {
    updateState();

    window.addEventListener('focus', updateState);
    window.addEventListener('blur', updateState);
    document.addEventListener('visibilitychange', updateState);

    return () => {
      window.removeEventListener('focus', updateState);
      window.removeEventListener('blur', updateState);
      document.removeEventListener('visibilitychange', updateState);
    };
  }, [updateState]);

  return state;
}
