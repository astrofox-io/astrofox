import { LABEL_WIDTH, MAX_TRACK_WIDTH, TRACK_PADDING } from './constants';

/** Zoom multiplier per wheel pixel; one 100px mouse notch zooms about 1.22x. */
const WHEEL_ZOOM_SENSITIVITY = 0.002;
const LINE_HEIGHT_PX = 16;
const PAGE_HEIGHT_PX = 400;

export interface TimelineScale {
  /** Pixels per second at zoom 1, where the whole project fits the viewport. */
  fitPixelsPerSecond: number;
  /** Pixels per second at the requested zoom. */
  pixelsPerSecond: number;
  /** Highest zoom that still changes the layout (the track width is capped). */
  maxZoom: number;
}

export function getTimelineScale(
  viewportWidth: number,
  duration: number,
  zoom: number,
  zoomLimit: number,
): TimelineScale {
  const fitPixelsPerSecond = Math.max(
    1,
    (Math.max(0, viewportWidth - LABEL_WIDTH - TRACK_PADDING) || 600) / duration,
  );
  const maxZoom = Math.max(1, Math.min(zoomLimit, MAX_TRACK_WIDTH / duration / fitPixelsPerSecond));
  const pixelsPerSecond = Math.min(
    fitPixelsPerSecond * Math.max(1, Math.min(maxZoom, zoom)),
    MAX_TRACK_WIDTH / duration,
  );

  return { fitPixelsPerSecond, pixelsPerSecond, maxZoom };
}

/** Zoom factor for one wheel event: wheel up / pinch out zooms in. */
export function wheelZoomFactor(deltaY: number, deltaMode: number) {
  const pixels =
    deltaMode === 1 ? deltaY * LINE_HEIGHT_PX : deltaMode === 2 ? deltaY * PAGE_HEIGHT_PX : deltaY;
  return Math.exp(-pixels * WHEEL_ZOOM_SENSITIVITY);
}

/** Project time under a point `viewportX` px from the scroll container's left edge. */
export function timeAtViewportX(
  viewportX: number,
  scrollLeft: number,
  pixelsPerSecond: number,
  duration: number,
) {
  const time = (scrollLeft + viewportX - LABEL_WIDTH) / pixelsPerSecond;
  return Math.max(0, Math.min(duration, time));
}

/** The scrollLeft that puts `time` back under `viewportX` at a new scale. */
export function scrollLeftForAnchor(time: number, viewportX: number, pixelsPerSecond: number) {
  return Math.max(0, LABEL_WIDTH + time * pixelsPerSecond - viewportX);
}
