import React from 'react';
import { useTranslation } from 'react-i18next';
import { updateElementProperties } from '@/app/actions/scenes';
import { events, stage } from '@/app/global';
import { type DisplayTransformFrame, getDisplayTransformFrame } from './displayTransform';

type Handle = 'move' | 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const HANDLE_HIT_PADDING = 10;

interface DisplayTransformOverlayProps {
  activeElementId: string | null;
  displayDescriptor?: Record<string, unknown>;
  enabled?: boolean;
  stageWidth: number;
  stageHeight: number;
  zoom: number;
}

interface DragInteraction {
  elementId: string;
  handle: Handle;
  startClientX: number;
  startClientY: number;
  startFrame: DisplayTransformFrame;
  startProperties: Record<string, unknown>;
  finalProperties: Record<string, unknown> | null;
}

const HANDLE_VECTORS: Record<Exclude<Handle, 'move'>, [number, number]> = {
  n: [0, -1],
  e: [1, 0],
  s: [0, 1],
  w: [-1, 0],
  ne: [1, -1],
  nw: [-1, -1],
  se: [1, 1],
  sw: [-1, 1],
};

const HANDLE_CURSORS: Record<Handle, string> = {
  move: 'move',
  n: 'ns-resize',
  e: 'ew-resize',
  s: 'ns-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
};

function roundValue(value: number) {
  return Math.round(value);
}

function rotateLocalToScreen(x: number, y: number, rotation: number) {
  const theta = (rotation * Math.PI) / 180;
  return {
    x: x * Math.cos(theta) - y * Math.sin(theta),
    y: x * Math.sin(theta) + y * Math.cos(theta),
  };
}

function screenToLocalDelta(x: number, y: number, rotation: number) {
  const theta = (rotation * Math.PI) / 180;
  return {
    x: x * Math.cos(theta) + y * Math.sin(theta),
    y: -x * Math.sin(theta) + y * Math.cos(theta),
  };
}

function pickUniformScale(...values: number[]) {
  let nextScale = 1;

  for (const value of values) {
    if (!Number.isFinite(value)) {
      continue;
    }

    if (Math.abs(value - 1) > Math.abs(nextScale - 1)) {
      nextScale = value;
    }
  }

  return Math.max(0.05, nextScale);
}

function getCircularResizeProperties(frame: DisplayTransformFrame, scale: number) {
  if (frame.kind === 'radialSpectrum') {
    return {
      radius: roundValue(Math.max(1, frame.radius * scale)),
      innerRadius: roundValue(Math.max(0, frame.innerRadius * scale)),
    };
  }

  if (frame.kind === 'waveformRing') {
    return {
      radius: roundValue(Math.max(1, frame.radius * scale)),
      amplitude: roundValue(Math.max(0, frame.amplitude * scale)),
      lineWidth: roundValue(Math.max(1, frame.lineWidth * scale)),
    };
  }

  return null;
}

function buildDragResult(
  frame: DisplayTransformFrame,
  startProperties: Record<string, unknown>,
  handle: Handle,
  deltaX: number,
  deltaY: number,
  stageWidth: number,
  stageHeight: number,
) {
  if (handle === 'move') {
    return {
      frame: {
        ...frame,
        x: frame.x + deltaX,
        y: frame.y + deltaY,
      },
      properties: {
        x: roundValue(frame.x + deltaX),
        y: roundValue(frame.y + deltaY),
      },
    };
  }

  const [handleX, handleY] = HANDLE_VECTORS[handle];
  const localDelta = screenToLocalDelta(deltaX, deltaY, frame.rotation);
  const minRenderWidth = (frame.widthOffset + 1) * frame.displayZoom;
  const minRenderHeight = (frame.heightOffset + 1) * frame.displayZoom;
  let renderWidth = frame.renderWidth;
  let renderHeight = frame.renderHeight;
  const nextProperties: Record<string, unknown> = {};

  if (frame.kind === 'text') {
    const scaleX =
      handleX !== 0 ? (frame.renderWidth + handleX * localDelta.x) / frame.renderWidth : Number.NaN;
    const scaleY =
      handleY !== 0
        ? (frame.renderHeight + handleY * localDelta.y) / frame.renderHeight
        : Number.NaN;
    const scale = pickUniformScale(scaleX, scaleY);

    renderWidth = Math.max(1, frame.renderWidth * scale);
    renderHeight = Math.max(1, frame.renderHeight * scale);
    nextProperties.size = roundValue(Math.max(1, frame.size * scale));
  } else if (frame.fixedAspect) {
    const scaleX =
      handleX !== 0 ? (frame.renderWidth + handleX * localDelta.x) / frame.renderWidth : Number.NaN;
    const scaleY =
      handleY !== 0
        ? (frame.renderHeight + handleY * localDelta.y) / frame.renderHeight
        : Number.NaN;
    const scale = pickUniformScale(scaleX, scaleY);

    renderWidth = Math.max(minRenderWidth, frame.renderWidth * scale);
    renderHeight = Math.max(minRenderHeight, frame.renderHeight * scale);
    const nextBaseWidth = renderWidth / frame.displayZoom;
    const nextBaseHeight = renderHeight / frame.displayZoom;
    const circularProperties = getCircularResizeProperties(frame, scale);

    if (circularProperties) {
      Object.assign(nextProperties, circularProperties);
    } else {
      nextProperties.width = roundValue(Math.max(1, nextBaseWidth - frame.widthOffset));
      nextProperties.height = roundValue(Math.max(1, nextBaseHeight - frame.heightOffset));
    }
  } else {
    if (handleX !== 0) {
      renderWidth = Math.max(minRenderWidth, frame.renderWidth + handleX * localDelta.x);
      const nextBaseWidth = renderWidth / frame.displayZoom;
      nextProperties.width = roundValue(Math.max(1, nextBaseWidth - frame.widthOffset));
    }

    if (handleY !== 0) {
      renderHeight = Math.max(minRenderHeight, frame.renderHeight + handleY * localDelta.y);
      const nextBaseHeight = renderHeight / frame.displayZoom;
      if (frame.heightIncludesShadow) {
        const currentTotalHeight = Math.max(1, frame.barHeight + frame.barShadowHeight);
        const scale = nextBaseHeight / currentTotalHeight;
        const nextBarHeight = Math.max(1, frame.barHeight * scale);
        const nextShadowHeight = Math.max(0, frame.barShadowHeight * scale);

        nextProperties.height = roundValue(nextBarHeight);
        nextProperties.shadowHeight = roundValue(nextShadowHeight);
      } else {
        nextProperties.height = roundValue(Math.max(1, nextBaseHeight - frame.heightOffset));
      }
    }
  }

  const shiftLocalX = handleX !== 0 ? (handleX * (renderWidth - frame.renderWidth)) / 2 : 0;
  const shiftLocalY = handleY !== 0 ? (handleY * (renderHeight - frame.renderHeight)) / 2 : 0;
  const shiftScreen = rotateLocalToScreen(shiftLocalX, shiftLocalY, frame.rotation);
  const startCenterScreenX = stageWidth / 2 + frame.x;
  const startCenterScreenY = stageHeight / 2 + frame.y;
  const nextCenterScreenX = startCenterScreenX + shiftScreen.x;
  const nextCenterScreenY = startCenterScreenY + shiftScreen.y;
  const nextX = nextCenterScreenX - stageWidth / 2;
  const nextY = nextCenterScreenY - stageHeight / 2;

  nextProperties.x = roundValue(nextX);
  nextProperties.y = roundValue(nextY);

  return {
    frame: {
      ...frame,
      x: nextX,
      y: nextY,
      renderWidth,
      renderHeight,
      size: nextProperties.size !== undefined ? Number(nextProperties.size) : frame.size,
    },
    properties: {
      ...startProperties,
      ...nextProperties,
    },
  };
}

function framesEqual(a: DisplayTransformFrame | null, b: DisplayTransformFrame | null) {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return (Object.keys(a) as (keyof DisplayTransformFrame)[]).every(key => a[key] === b[key]);
}

function hasChangedProperties(
  startProperties: Record<string, unknown>,
  finalProperties: Record<string, unknown> | null,
) {
  if (!finalProperties) {
    return false;
  }

  return Object.entries(finalProperties).some(([key, value]) => startProperties[key] !== value);
}

function getHandleAtPointerPosition(
  clientX: number,
  clientY: number,
  frame: DisplayTransformFrame,
  element: HTMLDivElement,
) {
  const bounds = element.getBoundingClientRect();
  const local = screenToLocalDelta(
    clientX - (bounds.left + bounds.width / 2),
    clientY - (bounds.top + bounds.height / 2),
    frame.rotation,
  );
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;

  if (
    Math.abs(local.x) > halfWidth + HANDLE_HIT_PADDING ||
    Math.abs(local.y) > halfHeight + HANDLE_HIT_PADDING
  ) {
    return null;
  }

  const nearLeft = Math.abs(local.x + halfWidth) <= HANDLE_HIT_PADDING;
  const nearRight = Math.abs(local.x - halfWidth) <= HANDLE_HIT_PADDING;
  const nearTop = Math.abs(local.y + halfHeight) <= HANDLE_HIT_PADDING;
  const nearBottom = Math.abs(local.y - halfHeight) <= HANDLE_HIT_PADDING;

  if (nearTop && nearLeft) {
    return 'nw';
  }

  if (nearTop && nearRight) {
    return 'ne';
  }

  if (nearBottom && nearRight) {
    return 'se';
  }

  if (nearBottom && nearLeft) {
    return 'sw';
  }

  if (nearTop) {
    return 'n';
  }

  if (nearRight) {
    return 'e';
  }

  if (nearBottom) {
    return 's';
  }

  if (nearLeft) {
    return 'w';
  }

  if (Math.abs(local.x) <= halfWidth && Math.abs(local.y) <= halfHeight) {
    return 'move';
  }

  return null;
}

export default function DisplayTransformOverlay({
  activeElementId,
  displayDescriptor,
  enabled = false,
  stageWidth,
  stageHeight,
  zoom,
}: DisplayTransformOverlayProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'stage' });
  const [draftFrame, setDraftFrame] = React.useState<DisplayTransformFrame | null>(() =>
    getDisplayTransformFrame(stage.getStageElementById(activeElementId || '')),
  );
  const [hoverHandle, setHoverHandle] = React.useState<Handle | null>(null);
  const interactionRef = React.useRef<DragInteraction | null>(null);

  // Re-derive the frame from the live display. Live property edits (e.g. typing
  // text) update the display element and request a render without committing to
  // the scene store, so we sync off the render loop rather than a prop change —
  // otherwise the overlay would go stale until the layer is reselected.
  React.useEffect(() => {
    function refresh() {
      if (interactionRef.current) {
        return;
      }

      const nextFrame = getDisplayTransformFrame(stage.getStageElementById(activeElementId || ''));

      setDraftFrame(current => (framesEqual(current, nextFrame) ? current : nextFrame));
    }

    refresh();
    events.on('render', refresh);

    return () => {
      events.off('render', refresh);
    };
  }, [activeElementId, displayDescriptor]);

  const handleWindowPointerMove = React.useCallback(
    (event: PointerEvent) => {
      const interaction = interactionRef.current;

      if (!interaction) {
        return;
      }

      const deltaX = (event.clientX - interaction.startClientX) / Math.max(zoom, 0.01);
      const deltaY = (event.clientY - interaction.startClientY) / Math.max(zoom, 0.01);
      const nextResult = buildDragResult(
        interaction.startFrame,
        interaction.startProperties,
        interaction.handle,
        deltaX,
        deltaY,
        stageWidth,
        stageHeight,
      );
      const element = stage.getStageElementById(interaction.elementId) as {
        update: (properties: Record<string, unknown>) => void;
      } | null;

      document.body.style.cursor = HANDLE_CURSORS[interaction.handle];
      element?.update(nextResult.properties);
      interaction.finalProperties = nextResult.properties;
      setDraftFrame(nextResult.frame);
    },
    [stageHeight, stageWidth, zoom],
  );

  const handleWindowPointerUp = React.useCallback(() => {
    const interaction = interactionRef.current;
    interactionRef.current = null;
    window.removeEventListener('pointermove', handleWindowPointerMove);
    window.removeEventListener('pointerup', handleWindowPointerUp);
    window.removeEventListener('pointercancel', handleWindowPointerUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    if (
      interaction &&
      hasChangedProperties(interaction.startProperties, interaction.finalProperties)
    ) {
      updateElementProperties(interaction.elementId, interaction.finalProperties || {});
    }
  }, [handleWindowPointerMove]);

  React.useEffect(() => {
    return () => {
      handleWindowPointerUp();
    };
  }, [handleWindowPointerUp]);

  const startInteraction = React.useCallback(
    (handle: Handle) => (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!draftFrame || !activeElementId) {
        return;
      }

      const element = stage.getStageElementById(activeElementId) as {
        properties?: Record<string, unknown>;
      } | null;

      if (!element?.properties) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      document.body.style.cursor = HANDLE_CURSORS[handle];

      interactionRef.current = {
        elementId: activeElementId,
        handle,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startFrame: draftFrame,
        startProperties: { ...element.properties },
        finalProperties: null,
      };

      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', handleWindowPointerMove);
      window.addEventListener('pointerup', handleWindowPointerUp);
      window.addEventListener('pointercancel', handleWindowPointerUp);
    },
    [activeElementId, draftFrame, handleWindowPointerMove, handleWindowPointerUp],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draftFrame || interactionRef.current) {
        return;
      }

      const nextHandle = getHandleAtPointerPosition(
        event.clientX,
        event.clientY,
        draftFrame,
        event.currentTarget,
      );
      setHoverHandle(current => (current === nextHandle ? current : nextHandle));
    },
    [draftFrame],
  );

  const handlePointerLeave = React.useCallback(() => {
    if (interactionRef.current) {
      return;
    }

    setHoverHandle(null);
  }, []);

  if (!enabled || !draftFrame) {
    return null;
  }

  const resizeTopLabel = t('resize-top');
  const resizeRightLabel = t('resize-right');
  const resizeBottomLabel = t('resize-bottom');
  const resizeLeftLabel = t('resize-left');

  const frame = draftFrame;
  const centerX = stageWidth / 2 + frame.x;
  const centerY = stageHeight / 2 + frame.y;
  const centerXPx = Math.round(centerX * zoom);
  const centerYPx = Math.round(centerY * zoom);
  const widthPx = Math.max(1, Math.round(frame.renderWidth * zoom));
  const heightPx = Math.max(1, Math.round(frame.renderHeight * zoom));

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div
        className="absolute pointer-events-auto"
        style={{
          left: centerXPx,
          top: centerYPx,
          width: widthPx,
          height: heightPx,
          cursor: hoverHandle ? HANDLE_CURSORS[hoverHandle] : 'default',
          transform: `translate(-50%, -50%) rotate(${frame.rotation}deg)`,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 shadow-[0_0_0_1px_rgba(0,0,0,0.65)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-primary" />
          <div className="absolute inset-y-0 right-0 w-px bg-primary" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-primary" />
          <div className="absolute inset-y-0 left-0 w-px bg-primary" />
        </div>
        <button
          type="button"
          aria-label={t('move-layer')}
          className="absolute inset-[10px] cursor-move pointer-events-auto bg-transparent"
          onPointerDown={startInteraction('move')}
        />
        <button
          type="button"
          aria-label={resizeTopLabel}
          className="absolute -top-[5px] left-[10px] right-[10px] h-2.5 cursor-ns-resize pointer-events-auto bg-transparent"
          onPointerDown={startInteraction('n')}
        />
        <button
          type="button"
          aria-label={resizeRightLabel}
          className="absolute -right-[5px] top-[10px] bottom-[10px] w-2.5 cursor-ew-resize pointer-events-auto bg-transparent"
          onPointerDown={startInteraction('e')}
        />
        <button
          type="button"
          aria-label={resizeBottomLabel}
          className="absolute -bottom-[5px] left-[10px] right-[10px] h-2.5 cursor-ns-resize pointer-events-auto bg-transparent"
          onPointerDown={startInteraction('s')}
        />
        <button
          type="button"
          aria-label={resizeLeftLabel}
          className="absolute -left-[5px] top-[10px] bottom-[10px] w-2.5 cursor-ew-resize pointer-events-auto bg-transparent"
          onPointerDown={startInteraction('w')}
        />
        {[
          {
            handle: 'nw' as const,
            className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
            label: t('resize-top-left'),
          },
          {
            handle: 'ne' as const,
            className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
            label: t('resize-top-right'),
          },
          {
            handle: 'se' as const,
            className: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
            label: t('resize-bottom-right'),
          },
          {
            handle: 'sw' as const,
            className: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
            label: t('resize-bottom-left'),
          },
          {
            handle: 'n' as const,
            className: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
            label: t('resize-top-edge'),
          },
          {
            handle: 'e' as const,
            className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
            label: t('resize-right-edge'),
          },
          {
            handle: 's' as const,
            className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
            label: t('resize-bottom-edge'),
          },
          {
            handle: 'w' as const,
            className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
            label: t('resize-left-edge'),
          },
        ].map(item => (
          <button
            key={item.handle + item.label}
            type="button"
            aria-label={item.label}
            className={`absolute h-2.5 w-2.5 border border-primary bg-white pointer-events-auto ${item.className}`}
            onPointerDown={startInteraction(item.handle)}
          />
        ))}
      </div>
    </div>
  );
}
