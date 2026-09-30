import { create } from 'zustand';
import { connectMicrophone, connectMidiInput, openAudioFile } from '@/app/actions/audio';
import { raiseError } from '@/app/actions/error';
import { saveVideo } from '@/app/actions/export';
import { showModal } from '@/app/actions/modals';
import {
  checkUnsavedChanges,
  newProject,
  openProjectFile,
  saveProject,
  trackProjectChanges,
} from '@/app/actions/project';
import { projectDocument } from '@/app/document';
import { api, library, logger, renderBackend, renderer } from '@/app/global';
import { getAutomaticUpdates } from '@/app/preferences';
import { t } from '@/i18n/config';
import { registerGeneratedNameLabels } from '@/i18n/labels';
import * as displays from '@/lib/displays';
import { hasLayer, selectionAfterRemoval } from '@/lib/document/selection';
import type { DocumentChange } from '@/lib/document/types';
import * as effects from '@/lib/effects';
import { platform } from '@/lib/platform';
import { loadInstalledPlugins } from '@/lib/plugins';
import { getTransportState, initTransport } from '@/lib/timeline/transport';
import {
  copyProperties,
  duplicateLayer,
  initializeHistory,
  pasteProperties,
  redo,
  undo,
} from './history';

export interface VideoExportSegment {
  startPosition: number;
  endPosition: number;
}

export type AddMenuKind = 'effects' | 'displays';

export interface AddMenuState {
  sceneId: string;
  kind: AddMenuKind;
}

interface AppState {
  statusText: string;
  showReactor: boolean;
  activeReactorId: string | null;
  activeElementId: string | null;
  cameraModeEnabled: boolean;
  displayTransformModeEnabled: boolean;
  isLeftPanelVisible: boolean;
  isBottomPanelVisible: boolean;
  isRightPanelVisible: boolean;
  controlsPanelMode: 'active' | 'all';
  isVideoRecording: boolean;
  isStagePictureInPictureActive: boolean;
  videoExportSegment: VideoExportSegment | null;
  /** Export playhead position (0-1 of total duration) while an offline export is running. */
  videoExportPosition: number | null;
  pluginsUpdatedAt: number;
  /** Slide-out "add element" menu (effects / 2D / 3D displays) for a scene. */
  addMenu: AddMenuState | null;
}

interface CaptureStreamCanvas {
  captureStream: (frameRate?: number) => MediaStream;
}

interface PluginConfig {
  name: string;
  label: string;
  type: string;
  defaultProperties: Record<string, unknown>;
  icon?: string;
  builtin?: boolean;
}

type LibraryPlugin = {
  config: PluginConfig;
};

type LibraryConstructor = (new (properties?: Record<string, unknown>) => unknown) & LibraryPlugin;

const initialState: AppState = {
  statusText: '',
  showReactor: false,
  activeReactorId: null,
  activeElementId: null,
  cameraModeEnabled: false,
  displayTransformModeEnabled: false,
  isLeftPanelVisible: true,
  isBottomPanelVisible: true,
  isRightPanelVisible: true,
  controlsPanelMode: 'all',
  isVideoRecording: false,
  isStagePictureInPictureActive: false,
  videoExportSegment: null,
  videoExportPosition: null,
  pluginsUpdatedAt: 0,
  addMenu: null,
};

const appStore = create<AppState>(() => ({
  ...initialState,
}));

let appInitPromise: Promise<void> | null = null;
let appInitialized = false;
let stagePictureInPictureVideo: HTMLVideoElement | null = null;
let stagePictureInPictureStream: MediaStream | null = null;

/** Frame rate of the picture-in-picture stream. */
const DEFAULT_VIDEO_FPS = 60;
function cleanupStagePictureInPictureStream() {
  for (const track of stagePictureInPictureStream?.getTracks() || []) {
    track.stop();
  }

  stagePictureInPictureStream = null;

  if (stagePictureInPictureVideo) {
    stagePictureInPictureVideo.srcObject = null;
  }
}

function handleStagePictureInPictureLeave() {
  cleanupStagePictureInPictureStream();
  appStore.setState({ isStagePictureInPictureActive: false });
}

function ensureStagePictureInPictureVideo(): HTMLVideoElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  if (stagePictureInPictureVideo) {
    return stagePictureInPictureVideo;
  }

  const video = document.createElement('video');
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.style.position = 'fixed';
  video.style.top = '-9999px';
  video.style.left = '-9999px';
  video.style.width = '1px';
  video.style.height = '1px';
  video.style.opacity = '0';
  video.style.pointerEvents = 'none';
  video.addEventListener('leavepictureinpicture', handleStagePictureInPictureLeave);
  document.body.appendChild(video);
  stagePictureInPictureVideo = video;

  return stagePictureInPictureVideo;
}

export function isStagePictureInPictureSupported() {
  if (typeof document === 'undefined') {
    return false;
  }

  const video = document.createElement('video');

  return Boolean(
    document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function',
  );
}

export async function saveImage() {
  // Same web File System Access path as the browser build (no native dialog).
  const { fileHandle, filePath, canceled } = await api.showSaveDialog({
    defaultPath: `image-${Date.now()}.png`,
    filters: [
      { name: 'PNG', extensions: ['png'] },
      { name: 'JPEG', extensions: ['jpg'] },
    ],
  });

  if (!canceled) {
    try {
      // Drawn like an export frame, so media and effects are exactly at the playhead.
      const { time, fps } = getTransportState();
      await renderer.renderAt(time, fps);

      const fileName = fileHandle?.name || filePath || `image-${Date.now()}.png`;
      const isJpeg = /jpe?g$/i.test(fileName);
      const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
      const buffer = renderBackend.getImage(mimeType);

      await api.saveImageFile(fileHandle || filePath || fileName, buffer, {
        mimeType,
        fileName,
      });

      logger.log('Image saved:', fileName);
    } catch (error) {
      raiseError(t('errors.save-image-failed'), error);
    }
  }
}

export async function startStagePictureInPicture() {
  if (!isStagePictureInPictureSupported()) {
    raiseError(t('errors.picture-in-picture-unsupported'));
    return false;
  }

  const canvas = renderBackend.getCanvas?.() as CaptureStreamCanvas | null;

  if (!canvas || typeof canvas.captureStream !== 'function') {
    raiseError(t('errors.stage-canvas-picture-in-picture-access-failed'));
    return false;
  }

  const video = ensureStagePictureInPictureVideo();

  if (!video) {
    raiseError(t('errors.picture-in-picture-init-failed'));
    return false;
  }

  try {
    renderer.requestRender();

    if (document.pictureInPictureElement && document.pictureInPictureElement !== video) {
      await document.exitPictureInPicture();
    }

    cleanupStagePictureInPictureStream();
    stagePictureInPictureStream = canvas.captureStream(DEFAULT_VIDEO_FPS);
    video.srcObject = stagePictureInPictureStream;
    await video.play();
    await video.requestPictureInPicture();
    appStore.setState({ isStagePictureInPictureActive: true });
    return true;
  } catch (error) {
    handleStagePictureInPictureLeave();
    raiseError(t('errors.start-picture-in-picture-failed'), error);
    return false;
  }
}

export async function stopStagePictureInPicture() {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    if (
      stagePictureInPictureVideo &&
      document.pictureInPictureElement === stagePictureInPictureVideo
    ) {
      await document.exitPictureInPicture();
    } else {
      handleStagePictureInPictureLeave();
    }

    return true;
  } catch (error) {
    raiseError(t('errors.close-picture-in-picture-failed'), error);
    return false;
  }
}

export function toggleStagePictureInPicture() {
  if (appStore.getState().isStagePictureInPictureActive) {
    return stopStagePictureInPicture();
  }

  return startStagePictureInPicture();
}

export function setActiveReactorId(reactorId?: string | null) {
  appStore.setState({ activeReactorId: reactorId || null });
}

export function setControlsPanelMode(mode: 'active' | 'all') {
  appStore.setState({ controlsPanelMode: mode });
}

export function setActiveElementId(elementId?: string | null) {
  appStore.setState({ activeElementId: elementId || null });
}

/**
 * Never leave a removed layer or reactor selected, whichever path removed it
 * (Layers panel, automation, undo). A removed layer passes the selection to
 * its neighbour; a newly loaded project starts with nothing selected.
 */
function keepSelectionValid({ kind, previous, state }: DocumentChange) {
  const { activeElementId, activeReactorId } = appStore.getState();

  if (activeElementId && !hasLayer(state, activeElementId)) {
    setActiveElementId(
      kind === 'load' ? null : selectionAfterRemoval(previous, state, activeElementId),
    );
  }

  if (activeReactorId && !state.reactors.some(reactor => reactor.id === activeReactorId)) {
    setActiveReactorId(null);
  }
}

export function setCameraModeEnabled(enabled: boolean) {
  appStore.setState({ cameraModeEnabled: enabled });
  renderer.setContinuousRendering('camera-mode', enabled);
  renderer.requestRender();
}

export function setDisplayTransformModeEnabled(enabled: boolean) {
  appStore.setState({ displayTransformModeEnabled: enabled });
  renderer.setContinuousRendering('display-transform', enabled);
  renderer.requestRender();
}

export function toggleCameraMode() {
  setCameraModeEnabled(!appStore.getState().cameraModeEnabled);
}

export function openAddMenu(sceneId: string, kind: AddMenuKind) {
  appStore.setState({ addMenu: { sceneId, kind } });
}

export function closeAddMenu() {
  if (appStore.getState().addMenu) {
    appStore.setState({ addMenu: null });
  }
}

export function toggleLeftPanelVisibility() {
  appStore.setState(state => ({
    isLeftPanelVisible: !state.isLeftPanelVisible,
  }));
}

export function toggleBottomPanelVisibility() {
  appStore.setState(state => ({
    isBottomPanelVisible: !state.isBottomPanelVisible,
  }));
}

export function toggleRightPanelVisibility() {
  appStore.setState(state => ({
    isRightPanelVisible: !state.isRightPanelVisible,
  }));
}

export async function handleMenuAction(action: string) {
  switch (action) {
    case 'undo':
      undo();
      break;
    case 'redo':
      redo();
      break;
    case 'duplicate-layer':
      duplicateLayer();
      break;
    case 'copy-properties':
      copyProperties();
      break;
    case 'paste-properties':
      pasteProperties();
      break;
    case 'new-project':
      await checkUnsavedChanges(action, newProject);
      break;

    case 'open-project':
      await checkUnsavedChanges(action, openProjectFile);
      break;

    case 'save-project':
      await saveProject(undefined);
      break;

    case 'load-audio':
      await openAudioFile(undefined);
      break;

    case 'use-microphone':
      await connectMicrophone(undefined);
      break;

    case 'use-midi':
      await connectMidiInput(undefined);
      break;

    case 'save-image':
      await saveImage();
      break;

    case 'save-video':
      await saveVideo();
      break;

    case 'edit-canvas':
      await showModal('CanvasSettings', {
        titleKey: 'menu.project-settings',
        showCloseButton: false,
      });
      break;

    case 'manage-plugins':
      await showModal('ManagePlugins', {
        titleKey: 'menu.manage-plugins',
      });
      break;

    case 'app-settings':
      await showModal('AppSettings', { titleKey: 'settings.title' });
      break;

    case 'open-dev-tools':
      api.openDevTools();
      break;
  }
}

export async function loadPlugins() {
  let plugins: Record<string, LibraryConstructor> = {};

  try {
    plugins = (await loadInstalledPlugins()) as unknown as Record<string, LibraryConstructor>;
  } catch (e) {
    logger.error(e);
  }

  library.set('plugins', plugins);
}

// Rebuilds the library after a plugin install/uninstall and nudges any UI
// that lists library entries (e.g. the Add menus) to re-render.
export async function reloadPluginLibrary() {
  await loadPlugins();
  await loadLibrary();

  appStore.setState({ pluginsUpdatedAt: Date.now() });
}

export async function loadLibrary() {
  const plugins = (library.get('plugins') ?? {}) as Record<string, LibraryConstructor>;

  // Core displays/effects ship with the app and can't be removed; they are
  // flagged builtin so UI can tell them apart from installed plugins.
  const coreDisplays: Record<string, LibraryConstructor> = {};
  for (const [key, display] of Object.entries(displays as Record<string, LibraryConstructor>)) {
    display.config.icon = `images/controls/${key}.png`;
    display.config.builtin = true;

    coreDisplays[key] = display;
  }

  const coreEffects: Record<string, LibraryConstructor> = {};
  for (const [key, effect] of Object.entries(effects as Record<string, LibraryConstructor>)) {
    effect.config.icon = `images/controls/${key}.png`;
    effect.config.builtin = true;

    coreEffects[key] = effect;
  }

  for (const [key, plugin] of Object.entries(plugins)) {
    const { type } = plugin.config;

    if (type === 'display') {
      coreDisplays[key] = plugin;
    } else if (type === 'effect') {
      coreEffects[key] = plugin;
    }
  }

  library.set('displays', coreDisplays);
  library.set('effects', coreEffects);

  registerGeneratedNameLabels(
    [...Object.values(coreDisplays), ...Object.values(coreEffects)].map(
      entity => entity.config.label,
    ),
  );
}

let updateWatcherAttached = false;
const AUTO_UPDATE_CHECK_DELAY_MS = 5000;

/**
 * Kick off a background update check shortly after startup when the user has
 * automatic update checks enabled.
 */
function scheduleAutoUpdateCheck() {
  if (!getAutomaticUpdates()) {
    logger.log('Automatic update check skipped: disabled in settings');
    return;
  }

  const { updater } = platform;
  if (!updater) {
    logger.log('Automatic update check skipped: updater unavailable');
    return;
  }

  window.setTimeout(() => {
    logger.log('Checking for updates');
    updater.check().catch(error => {
      logger.log('Update check failed:', error);
    });
  }, AUTO_UPDATE_CHECK_DELAY_MS);
}

/** Download available desktop updates in the background. */
function watchDesktopUpdates() {
  if (updateWatcherAttached) {
    return;
  }
  const { updater } = platform;
  if (!updater) {
    return;
  }
  updateWatcherAttached = true;

  updater.onStatus(status => {
    if (status.state === 'available') {
      // Always download available updates; they install automatically on quit.
      updater.download().catch(error => {
        logger.log('Update download failed:', error);
      });
    }
  });
}

export async function initApp() {
  if (appInitialized) {
    return;
  }

  if (appInitPromise) {
    return appInitPromise;
  }

  appInitPromise = (async () => {
    await loadPlugins();
    await loadLibrary();
    projectDocument.subscribe(keepSelectionValid);
    trackProjectChanges();
    newProject();

    initTransport();
    initializeHistory();
    renderer.start();
    appInitialized = true;
    watchDesktopUpdates();
    scheduleAutoUpdateCheck();
  })().finally(() => {
    appInitPromise = null;
  });

  return appInitPromise;
}

export default appStore;
