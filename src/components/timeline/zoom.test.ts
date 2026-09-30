import { describe, expect, it } from 'vitest';
import { LABEL_WIDTH, MAX_TRACK_WIDTH, TRACK_PADDING } from './constants';
import { getTimelineScale, scrollLeftForAnchor, timeAtViewportX, wheelZoomFactor } from './zoom';

describe('getTimelineScale', () => {
  const viewport = LABEL_WIDTH + TRACK_PADDING + 1000;

  it('fits the project at zoom 1 and scales linearly', () => {
    const fit = getTimelineScale(viewport, 10, 1, 64);
    expect(fit.pixelsPerSecond).toBe(100);
    expect(getTimelineScale(viewport, 10, 4, 64).pixelsPerSecond).toBe(400);
  });

  it('caps zoom where the track would exceed its maximum width', () => {
    const scale = getTimelineScale(viewport, 10, 64, 64);
    expect(scale.maxZoom).toBe(MAX_TRACK_WIDTH / 10 / 100);
    expect(scale.pixelsPerSecond * 10).toBe(MAX_TRACK_WIDTH);
  });

  it('caps zoom at the configured limit when the track cap allows more', () => {
    const narrow = LABEL_WIDTH + TRACK_PADDING + 100;
    expect(getTimelineScale(narrow, 1, 1000, 64).maxZoom).toBe(64);
  });

  it('never zooms out past fit', () => {
    expect(getTimelineScale(viewport, 10, 0.1, 64).pixelsPerSecond).toBe(100);
  });
});

describe('wheelZoomFactor', () => {
  it('zooms in on wheel up and out on wheel down, symmetrically', () => {
    const zoomIn = wheelZoomFactor(-100, 0);
    const zoomOut = wheelZoomFactor(100, 0);
    expect(zoomIn).toBeGreaterThan(1);
    expect(zoomOut).toBeLessThan(1);
    expect(zoomIn * zoomOut).toBeCloseTo(1);
  });

  it('normalizes line and page deltas to pixels', () => {
    expect(wheelZoomFactor(1, 1)).toBeCloseTo(wheelZoomFactor(16, 0));
    expect(wheelZoomFactor(1, 2)).toBeCloseTo(wheelZoomFactor(400, 0));
  });
});

describe('anchored zoom', () => {
  it('keeps the anchored time under the same point after rescaling', () => {
    const viewportX = LABEL_WIDTH + 300;
    const time = timeAtViewportX(viewportX, 500, 100, 60);
    const scrollLeft = scrollLeftForAnchor(time, viewportX, 250);
    expect(timeAtViewportX(viewportX, scrollLeft, 250, 60)).toBeCloseTo(time);
  });

  it('clamps the anchor time to the project', () => {
    expect(timeAtViewportX(LABEL_WIDTH - 50, 0, 100, 10)).toBe(0);
    expect(timeAtViewportX(LABEL_WIDTH + 5000, 0, 100, 10)).toBe(10);
  });

  it('never scrolls before the start', () => {
    expect(scrollLeftForAnchor(0, LABEL_WIDTH + 300, 100)).toBe(0);
  });
});
