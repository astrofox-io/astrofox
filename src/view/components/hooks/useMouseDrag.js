import { useRef, useCallback } from 'react';

export default function useMouseDrag() {
  const startEvent = useRef();
  const eventProps = useRef();

  const handleMouseMove = useCallback(e => {
    const { pageX, pageY } = startEvent.current;
    const { onDrag, ...otherProps } = eventProps.current;

    if (onDrag) {
      onDrag({ x: e.pageX - pageX, y: e.pageY - pageY, ...otherProps }, e);
    }
  }, []);

  const handleMouseUp = useCallback(e => {
    const { onDragEnd } = eventProps.current;

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mousemove', handleMouseUp);

    if (onDragEnd) {
      onDragEnd(e);
    }
  }, []);

  function startDrag(e, props = {}) {
    e.persist();
    startEvent.current = e;
    eventProps.current = props;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  return startDrag;
}
