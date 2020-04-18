import { useState, useCallback, useLayoutEffect } from 'react';

export default function useMeasure() {
  const [dimensions, setDimensions] = useState({});
  const [node, setNode] = useState(null);

  const ref = useCallback(node => setNode(node), []);
  const measure = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (node) {
        setDimensions(node.getBoundingClientRect().toJSON());
      }
    });
  }, [node]);

  useLayoutEffect(() => {
    if (node) {
      measure();

      window.addEventListener('resize', measure);
      window.addEventListener('scroll', measure);

      return () => {
        window.removeEventListener('resize', measure);
        window.removeEventListener('scroll', measure);
      };
    }
  }, [node]);

  return [ref, dimensions, measure];
}
