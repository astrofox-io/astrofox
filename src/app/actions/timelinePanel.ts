import { create } from 'zustand';
import { getBoolean, getNumber, setBoolean, setNumber } from '@/lib/storage';

/** Editor-only state of the timeline panel (not part of the project). */

const HEIGHT_KEY = 'astrofox.timeline.height';
const SNAP_KEY = 'astrofox.timeline.snap';

export const TIMELINE_MIN_HEIGHT = 140;
export const TIMELINE_MAX_HEIGHT = 640;
export const TIMELINE_DEFAULT_HEIGHT = 240;
export const TIMELINE_MAX_ZOOM = 64;

interface TimelinePanelState {
  /** Hidden at startup; opening it lasts only for the session. */
  open: boolean;
  height: number;
  /** Horizontal zoom as a multiple of "fit the whole project". */
  zoom: number;
  /** Snap clip edges and the playhead to whole frames. */
  snap: boolean;
  /** Scene IDs whose rows are collapsed. */
  collapsed: Record<string, boolean>;
}

function clampHeight(height: number) {
  return Math.max(TIMELINE_MIN_HEIGHT, Math.min(TIMELINE_MAX_HEIGHT, Math.round(height)));
}

const timelinePanelStore = create<TimelinePanelState>(() => ({
  open: false,
  height: clampHeight(getNumber(HEIGHT_KEY, TIMELINE_DEFAULT_HEIGHT)),
  zoom: 1,
  snap: getBoolean(SNAP_KEY, true),
  collapsed: {},
}));

export function setTimelineOpen(open: boolean) {
  timelinePanelStore.setState({ open });
}

export function toggleTimelineOpen() {
  setTimelineOpen(!timelinePanelStore.getState().open);
}

export function setTimelineHeight(height: number) {
  const next = clampHeight(height);
  timelinePanelStore.setState({ height: next });
  setNumber(HEIGHT_KEY, next);
}

export function setTimelineZoom(zoom: number) {
  timelinePanelStore.setState({
    zoom: Math.max(1, Math.min(TIMELINE_MAX_ZOOM, Number.isFinite(zoom) ? zoom : 1)),
  });
}

export function setTimelineSnap(snap: boolean) {
  timelinePanelStore.setState({ snap });
  setBoolean(SNAP_KEY, snap);
}

export function toggleSceneCollapsed(sceneId: string) {
  timelinePanelStore.setState(state => ({
    collapsed: { ...state.collapsed, [sceneId]: !state.collapsed[sceneId] },
  }));
}

export default timelinePanelStore;
