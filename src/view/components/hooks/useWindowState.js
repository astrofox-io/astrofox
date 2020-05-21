import { useEffect, useCallback, useState } from 'react';
import { getWindow } from 'utils/window';

export default function useWindowState() {
  const win = getWindow();
  const [state, setState] = useState({
    focused: win.isFocused(),
    maximized: win.isMaximized(),
    minimized: win.isMinimized(),
  });

  const updateState = useCallback(() => {
    setState({
      focused: win.isFocused(),
      maximized: win.isMaximized(),
      minimized: win.isMinimized(),
    });
  }, [win]);

  useEffect(() => {
    win.on('minimize', updateState);
    win.on('maximize', updateState);
    win.on('unmaximize', updateState);
    win.on('focus', updateState);
    win.on('blur', updateState);

    return () => {
      win.off('minimize', updateState);
      win.off('maximize', updateState);
      win.off('unmaximize', updateState);
      win.off('focus', updateState);
      win.off('blur', updateState);
    };
  }, [win]);

  return state;
}
