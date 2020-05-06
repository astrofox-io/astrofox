import { useRef, useCallback } from 'react';

export default function useTimeout(func, delay) {
  const timer = useRef();

  return useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(func, delay);
  }, [func, delay]);
}
