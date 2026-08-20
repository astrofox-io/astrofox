import { Download, PictureInPicture2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import useApp, {
  isStagePictureInPictureSupported,
  setCameraModeEnabled,
  setDisplayTransformModeEnabled,
  toggleStagePictureInPicture,
} from '@/app/actions/app';
import useAudioStore, { loadAudioFile } from '@/app/actions/audio';
import useScenes from '@/app/actions/scenes';
import useStage from '@/app/actions/stage';
import { renderBackend, renderer, stage } from '@/app/global';
import { VectorSquare, Video } from '@/app/icons';
import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { hasDisplayCamera } from '@/lib/utils/displayCamera';
import { ignoreEvents } from '@/lib/utils/react';
import DisplayTransformOverlay from './DisplayTransformOverlay';
import { isTransformable2DDisplay } from './displayTransform';

function isFileDrag(event: React.DragEvent) {
  const { types } = event.dataTransfer;
  return Array.from(types || []).includes('Files');
}

function acceptStageDrag(event: React.DragEvent) {
  if (!isFileDrag(event)) {
    return false;
  }

  ignoreEvents(event);
  event.dataTransfer.dropEffect = 'copy';
  return true;
}

export default function Stage() {
  const { t } = useTranslation(undefined, { keyPrefix: 'stage' });
  const [width, height, backgroundColor, zoom] = useStage(
    useShallow(state => [state.width, state.height, state.backgroundColor, state.zoom]),
  );
  const activeElementId = useApp(state => state.activeElementId);
  const cameraModeEnabled = useApp(state => state.cameraModeEnabled);
  const displayTransformModeEnabled = useApp(state => state.displayTransformModeEnabled);
  const isStagePictureInPictureActive = useApp(state => state.isStagePictureInPictureActive);
  const elementById = useScenes(state => state.elementById) as Record<
    string,
    Record<string, unknown>
  >;
  const canvas = useRef<HTMLCanvasElement>(null);
  const initProps = useRef({ width, height, backgroundColor });
  const loading = useAudioStore(state => state.loading);
  const [dropLoading, setDropLoading] = useState(false);
  const [dragOverStage, setDragOverStage] = useState(false);
  const [pictureInPictureSupported, setPictureInPictureSupported] = useState(false);
  const dragDepth = useRef(0);
  const activeDisplay = useMemo(
    () => stage.getStageElementById(activeElementId || ''),
    [activeElementId, elementById[activeElementId || '']],
  );
  const activeDisplayDescriptor = elementById[activeElementId || ''];
  const transformableDisplaySelected = isTransformable2DDisplay(activeDisplay);
  const activeElementHasCamera =
    !!activeDisplayDescriptor &&
    activeDisplayDescriptor.enabled !== false &&
    hasDisplayCamera(activeDisplayDescriptor as { name?: string });

  useEffect(() => {
    const { width, height, backgroundColor } = initProps.current;

    renderBackend.init({
      canvas: canvas.current,
      width,
      height,
      backgroundColor,
    });
    renderer.requestRender();

    return () => {
      renderer.stop();
      renderBackend.dispose();
    };
  }, []);

  useEffect(() => {
    setPictureInPictureSupported(isStagePictureInPictureSupported());
  }, []);

  useEffect(() => {
    if (!cameraModeEnabled && !displayTransformModeEnabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCameraModeEnabled(false);
        setDisplayTransformModeEnabled(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cameraModeEnabled, displayTransformModeEnabled]);

  useEffect(() => {
    if (cameraModeEnabled && !activeElementHasCamera) {
      setCameraModeEnabled(false);
    }
  }, [activeElementHasCamera, cameraModeEnabled]);

  useEffect(() => {
    if (displayTransformModeEnabled && !transformableDisplaySelected) {
      setDisplayTransformModeEnabled(false);
    }
  }, [displayTransformModeEnabled, transformableDisplaySelected]);

  async function handleDrop(e: React.DragEvent) {
    if (!acceptStageDrag(e)) {
      return;
    }

    dragDepth.current = 0;
    setDragOverStage(false);

    const file = e.dataTransfer.files[0];

    if (file) {
      setDropLoading(true);

      // Force one paint so the overlay spinner can appear immediately.
      await new Promise<void>(resolve => {
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
          window.requestAnimationFrame(() => resolve());
          return;
        }

        setTimeout(() => resolve(), 0);
      });

      try {
        await loadAudioFile(file);
      } finally {
        setDropLoading(false);
      }
    }
  }

  function handleStageDragEnter(e: React.DragEvent) {
    if (!acceptStageDrag(e)) {
      return;
    }

    dragDepth.current += 1;
    setDragOverStage(true);
  }

  function handleStageDragOver(e: React.DragEvent) {
    if (!acceptStageDrag(e)) {
      return;
    }

    if (!dragOverStage) {
      setDragOverStage(true);
    }
  }

  function handleStageDragLeave(e: React.DragEvent) {
    if (!acceptStageDrag(e)) {
      return;
    }

    dragDepth.current = Math.max(0, dragDepth.current - 1);

    if (dragDepth.current === 0) {
      setDragOverStage(false);
    }
  }

  const style = {
    width: `${width * zoom}px`,
    height: `${height * zoom}px`,
  };

  function handleCameraModeToggle() {
    if (!activeElementHasCamera) {
      return;
    }

    if (!cameraModeEnabled) {
      setDisplayTransformModeEnabled(false);
    }

    setCameraModeEnabled(!cameraModeEnabled);
  }

  function handleDisplayTransformModeToggle() {
    if (!transformableDisplaySelected) {
      return;
    }

    if (!displayTransformModeEnabled) {
      setCameraModeEnabled(false);
    }

    setDisplayTransformModeEnabled(!displayTransformModeEnabled);
  }

  function handleStagePictureInPictureToggle() {
    void toggleStagePictureInPicture();
  }

  const pictureInPictureLabel = isStagePictureInPictureActive
    ? t('close-picture-in-picture')
    : t('open-picture-in-picture');
  const layerTransformLabel = t('layer-transform');
  const cameraControlLabel = t('camera-control');

  return (
    <section
      aria-label="Stage"
      className={'flex flex-col flex-1 min-w-0 min-h-0 overflow-auto relative'}
      onDropCapture={handleDrop}
      onDragOverCapture={handleStageDragOver}
      onDragEnterCapture={handleStageDragEnter}
      onDragLeaveCapture={handleStageDragLeave}
      onDrop={handleDrop}
      onDragOver={handleStageDragOver}
      onDragEnter={handleStageDragEnter}
      onDragLeave={handleStageDragLeave}
    >
      <DragOverlay show={dragOverStage} />
      <div className="sticky top-2 z-60 flex h-0 shrink-0 items-start justify-center gap-2 overflow-visible">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<span />}>
              <Button
                type="button"
                variant={isStagePictureInPictureActive ? 'default' : 'outline'}
                size="icon-sm"
                aria-label={pictureInPictureLabel}
                className={cn('shadow-xl', {
                  'bg-neutral-800 hover:bg-neutral-700': !isStagePictureInPictureActive,
                })}
                disabled={!pictureInPictureSupported}
                onClick={handleStagePictureInPictureToggle}
              >
                <PictureInPicture2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={6}
              className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
            >
              {pictureInPictureLabel}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<span />}>
              <Button
                type="button"
                variant={
                  displayTransformModeEnabled && transformableDisplaySelected
                    ? 'default'
                    : 'outline'
                }
                size="icon-sm"
                aria-label={layerTransformLabel}
                className={cn('shadow-xl', {
                  'bg-neutral-800 hover:bg-neutral-700': !(
                    displayTransformModeEnabled && transformableDisplaySelected
                  ),
                })}
                disabled={!transformableDisplaySelected}
                onClick={handleDisplayTransformModeToggle}
              >
                <VectorSquare className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={6}
              className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
            >
              {layerTransformLabel}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<span />}>
              <Button
                type="button"
                variant={cameraModeEnabled && activeElementHasCamera ? 'default' : 'outline'}
                size="icon-sm"
                aria-label={cameraControlLabel}
                className={cn('shadow-xl', {
                  'bg-neutral-800 hover:bg-neutral-700': !(
                    cameraModeEnabled && activeElementHasCamera
                  ),
                })}
                disabled={!activeElementHasCamera}
                onClick={handleCameraModeToggle}
              >
                <Video className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={6}
              className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
            >
              {cameraControlLabel}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className={'m-auto'}>
        <div className={'relative flex flex-col justify-center shadow-xl m-5 z-50 bg-black'}>
          <canvas
            ref={canvas}
            style={style}
            onDrop={handleDrop}
            onDragOver={handleStageDragOver}
            onDragEnter={handleStageDragEnter}
            onDragLeave={handleStageDragLeave}
          />
          <DisplayTransformOverlay
            activeElementId={activeElementId}
            displayDescriptor={activeDisplayDescriptor}
            enabled={displayTransformModeEnabled}
            stageWidth={width}
            stageHeight={height}
            zoom={zoom}
          />
          <Loading show={loading || dropLoading} />
        </div>
      </div>
    </section>
  );
}

interface DragOverlayProps {
  show?: boolean;
}

const DragOverlay = ({ show = false }: DragOverlayProps) => {
  if (!show) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="flex h-44 w-44 items-center justify-center rounded-full border border-primary/40 bg-black/55 shadow-2xl">
        <Download className="h-24 w-24 text-primary" strokeWidth={1.8} />
      </div>
    </div>
  );
};

interface LoadingProps {
  show?: boolean;
}

const Loading = ({ show }: LoadingProps) => {
  const [visible, setVisible] = useState(show);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current as unknown as number);
      leaveTimer.current = null;
    }

    if (show) {
      setVisible(true);
      setLeaving(false);
      return undefined;
    }

    if (!visible) {
      return undefined;
    }

    setLeaving(true);
    leaveTimer.current = setTimeout(() => {
      setVisible(false);
      setLeaving(false);
      leaveTimer.current = null;
    }, 220);

    return () => {
      if (leaveTimer.current) {
        window.clearTimeout(leaveTimer.current as unknown as number);
        leaveTimer.current = null;
      }
    };
  }, [show, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className={'absolute inset-0 z-4 flex items-center justify-center pointer-events-none'}>
      <div
        className={`${'[animation:stage-loader-pop_220ms_ease-out]'} ${
          leaving ? '[animation:stage-loader-out_220ms_ease-in_forwards]' : ''
        }`}
      >
        <Spinner size={96} />
      </div>
    </div>
  );
};
