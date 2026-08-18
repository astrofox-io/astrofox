import { useEffect, useRef } from 'react';

export interface CameraOrbitState {
  azimuth: number;
  polar: number;
  distance: number;
}

export const CAMERA_MIN_DISTANCE = 0;
export const CAMERA_MAX_DISTANCE = 5000;
const CAMERA_PERSIST_DELAY_MS = 120;
const POLAR_LIMIT = Math.PI / 2 - 0.05;

export function clampCameraPolar(value: number) {
  return Math.max(-POLAR_LIMIT, Math.min(POLAR_LIMIT, value));
}

export function clampCameraDistance(value: number) {
  return Math.max(CAMERA_MIN_DISTANCE, Math.min(CAMERA_MAX_DISTANCE, value));
}

interface CameraOrbitOptions {
  /** Whether the stage canvas currently acts as an orbit controller. */
  enabled: boolean;
  /** Element receiving pointer/wheel input (the stage canvas). */
  element: HTMLElement | null | undefined;
  /** Current camera state (mutable ref owned by the caller). */
  stateRef: React.MutableRefObject<CameraOrbitState>;
  /** Apply a new state live (every pointer move / wheel tick). */
  onChange: (state: CameraOrbitState) => void;
  /** Persist the state (pointer up, or debounced after wheel). */
  onCommit: (state: CameraOrbitState) => void;
}

/**
 * Turns the stage canvas into an orbit controller for a display camera:
 * drag rotates azimuth/polar, wheel dollies distance. Shared by the core 3D
 * host (Display3DLayer) and camera-enabled worker plugins.
 *
 * Returns a ref that reports whether a drag is in progress, so callers can
 * skip re-applying persisted properties mid-drag.
 */
export function useCameraOrbit({
  enabled,
  element,
  stateRef,
  onChange,
  onCommit,
}: CameraOrbitOptions) {
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const persistTimeoutRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  const onCommitRef = useRef(onCommit);
  onChangeRef.current = onChange;
  onCommitRef.current = onCommit;

  useEffect(() => {
    if (!enabled || !element) {
      return;
    }

    const target = element;
    const ownerDocument = target.ownerDocument;
    target.style.cursor = 'grab';

    function clearPersistTimeout() {
      if (persistTimeoutRef.current !== null) {
        window.clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    }

    function schedulePersist(nextState: CameraOrbitState) {
      clearPersistTimeout();
      persistTimeoutRef.current = window.setTimeout(() => {
        persistTimeoutRef.current = null;
        onCommitRef.current(nextState);
      }, CAMERA_PERSIST_DELAY_MS);
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0) {
        return;
      }

      draggingRef.current = true;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      target.style.cursor = 'grabbing';
      event.preventDefault();
    }

    function handlePointerMove(event: PointerEvent) {
      if (!draggingRef.current) {
        return;
      }

      const dx = event.clientX - lastPointerRef.current.x;
      const dy = event.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };

      const current = stateRef.current;
      const nextState = {
        ...current,
        azimuth: current.azimuth - dx * 0.01,
        polar: clampCameraPolar(current.polar - dy * 0.01),
      };
      stateRef.current = nextState;
      onChangeRef.current(nextState);
    }

    function handlePointerUp() {
      if (!draggingRef.current) {
        return;
      }

      draggingRef.current = false;
      target.style.cursor = 'grab';
      clearPersistTimeout();
      onCommitRef.current(stateRef.current);
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault();

      const current = stateRef.current;
      const nextState = {
        ...current,
        distance: clampCameraDistance(current.distance * Math.exp(event.deltaY * 0.0015)),
      };
      stateRef.current = nextState;
      onChangeRef.current(nextState);
      schedulePersist(nextState);
    }

    target.addEventListener('pointerdown', handlePointerDown);
    ownerDocument.addEventListener('pointermove', handlePointerMove);
    ownerDocument.addEventListener('pointerup', handlePointerUp);
    target.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      clearPersistTimeout();
      draggingRef.current = false;
      target.style.cursor = '';
      target.removeEventListener('pointerdown', handlePointerDown);
      ownerDocument.removeEventListener('pointermove', handlePointerMove);
      ownerDocument.removeEventListener('pointerup', handlePointerUp);
      target.removeEventListener('wheel', handleWheel);
    };
  }, [enabled, element, stateRef]);

  return draggingRef;
}
