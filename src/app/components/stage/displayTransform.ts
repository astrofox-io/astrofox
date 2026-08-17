import { getDisplayTransformConfig } from '@/lib/core/Display';
import { hasDisplayCamera } from '@/lib/utils/displayCamera';

type CanvasLike = {
  width?: number;
  height?: number;
};

type TransformableDisplay = {
  type?: string;
  name?: string;
  enabled?: boolean;
  properties?: Record<string, unknown>;
  text?: { canvas?: CanvasLike };
  shape?: { canvas?: CanvasLike };
  wave?: { canvas?: CanvasLike };
  bars?: { canvas?: CanvasLike };
  radial?: { canvas?: CanvasLike };
  ring?: { canvas?: CanvasLike };
};

export type DisplayTransformKind = 'size' | 'text' | 'radialSpectrum' | 'waveformRing';

export interface DisplayTransformFrame {
  id: string;
  name: string;
  kind: DisplayTransformKind;
  x: number;
  y: number;
  rotation: number;
  displayZoom: number;
  renderWidth: number;
  renderHeight: number;
  widthOffset: number;
  heightOffset: number;
  fixedAspect: boolean;
  // Height handle scales height and shadowHeight together (bar spectrum).
  heightIncludesShadow: boolean;
  size: number;
  barHeight: number;
  barShadowHeight: number;
  radius: number;
  innerRadius: number;
  amplitude: number;
  lineWidth: number;
}

const CIRCULAR_PADDING = 4;

function getCanvasSize(display: TransformableDisplay) {
  const canvas =
    display.text?.canvas ||
    display.shape?.canvas ||
    display.wave?.canvas ||
    display.bars?.canvas ||
    display.radial?.canvas ||
    display.ring?.canvas;

  const width = Number(canvas?.width) || 0;
  const height = Number(canvas?.height) || 0;

  // A canvas collapsed to a line (or empty) has nothing to resize.
  if (width <= 1 || height <= 1) {
    return null;
  }

  return { width, height };
}

// Media displays declare an intrinsic size (transform.naturalSize) that
// applies while the width/height properties are still 0.
function getMediaSize(display: TransformableDisplay) {
  const natural = getDisplayTransformConfig(display).naturalSize?.(display as never);
  if (!natural) {
    return null;
  }

  const properties = display.properties || {};
  return {
    width: Number(properties.width) || Number(natural.width) || 0,
    height: Number(properties.height) || Number(natural.height) || 0,
  };
}

function getRadialSpectrumSize(properties: Record<string, unknown>) {
  const radius = Math.max(1, Number(properties.radius ?? 150));
  const innerRadius = Math.max(0, Number(properties.innerRadius ?? 80));
  const size = (radius + innerRadius) * 2 + CIRCULAR_PADDING;

  return {
    width: size,
    height: size,
    radius,
    innerRadius,
    amplitude: 0,
    lineWidth: 0,
  };
}

function getWaveformRingSize(properties: Record<string, unknown>) {
  const radius = Math.max(1, Number(properties.radius ?? 160));
  const amplitude = Math.max(0, Number(properties.amplitude ?? 80));
  const lineWidth = Math.max(1, Number(properties.lineWidth ?? 2));
  const size = (radius + amplitude + lineWidth + 2) * 2;

  return {
    width: size,
    height: size,
    radius,
    innerRadius: 0,
    amplitude,
    lineWidth,
  };
}

export function getDisplayTransformFrame(
  display?: TransformableDisplay | null,
): DisplayTransformFrame | null {
  if (
    !display ||
    display.enabled === false ||
    display.type !== 'display' ||
    hasDisplayCamera(display)
  ) {
    return null;
  }

  const properties = display.properties || {};
  const transform = getDisplayTransformConfig(display);
  const kind = transform.kind ?? 'size';
  const x = Number(properties.x ?? 0);
  const y = Number(properties.y ?? 0);
  const rotation = Number(properties.rotation ?? 0);
  const fixedAspect = properties.fixed !== false;
  const size = Math.max(1, Number(properties.size ?? 1));
  const displayZoom = Math.max(0.01, Number(properties.zoom ?? 1));

  if (transform.hasContent && !transform.hasContent(properties)) {
    return null;
  }

  if (kind === 'text') {
    const canvasSize = getCanvasSize(display);

    if (!canvasSize) {
      return null;
    }

    return {
      id: String((display as { id?: string }).id || ''),
      name: display.name || '',
      kind: 'text',
      x,
      y,
      rotation,
      displayZoom,
      renderWidth: canvasSize.width * displayZoom,
      renderHeight: canvasSize.height * displayZoom,
      widthOffset: 0,
      heightOffset: 0,
      fixedAspect: true,
      heightIncludesShadow: false,
      size,
      barHeight: 0,
      barShadowHeight: 0,
      radius: 0,
      innerRadius: 0,
      amplitude: 0,
      lineWidth: 0,
    };
  }

  if (kind === 'radialSpectrum') {
    const circularSize = getRadialSpectrumSize(properties);
    const renderWidth = circularSize.width * displayZoom;
    const renderHeight = circularSize.height * displayZoom;

    return {
      id: String((display as { id?: string }).id || ''),
      name: display.name || '',
      kind: 'radialSpectrum',
      x,
      y,
      rotation,
      displayZoom,
      renderWidth,
      renderHeight,
      widthOffset: 0,
      heightOffset: 0,
      fixedAspect: true,
      heightIncludesShadow: false,
      size,
      barHeight: 0,
      barShadowHeight: 0,
      radius: circularSize.radius,
      innerRadius: circularSize.innerRadius,
      amplitude: 0,
      lineWidth: 0,
    };
  }

  if (kind === 'waveformRing') {
    const circularSize = getWaveformRingSize(properties);
    const renderWidth = circularSize.width * displayZoom;
    const renderHeight = circularSize.height * displayZoom;

    return {
      id: String((display as { id?: string }).id || ''),
      name: display.name || '',
      kind: 'waveformRing',
      x,
      y,
      rotation,
      displayZoom,
      renderWidth,
      renderHeight,
      widthOffset: 0,
      heightOffset: 0,
      fixedAspect: true,
      heightIncludesShadow: false,
      size,
      barHeight: 0,
      barShadowHeight: 0,
      radius: circularSize.radius,
      innerRadius: 0,
      amplitude: circularSize.amplitude,
      lineWidth: circularSize.lineWidth,
    };
  }

  const canvasSize = getCanvasSize(display);
  const mediaSize = getMediaSize(display);
  const widthProperty = Number(properties.width ?? 0);
  const heightProperty = Number(properties.height ?? 0);
  const shadowHeightProperty = Math.max(0, Number(properties.shadowHeight ?? 0));
  const heightIncludesShadow = Boolean(transform.heightIncludesShadow);
  const keepsAspect =
    typeof transform.fixedAspect === 'function'
      ? transform.fixedAspect(properties)
      : Boolean(transform.fixedAspect);
  const editableWidth =
    widthProperty > 0 ? widthProperty : Number(mediaSize?.width || canvasSize?.width || 0);
  const editableHeight = heightIncludesShadow
    ? Math.max(1, heightProperty + shadowHeightProperty)
    : heightProperty > 0
      ? heightProperty
      : Number(mediaSize?.height || canvasSize?.height || 0);
  const baseRenderWidth = Math.max(
    editableWidth,
    Number(canvasSize?.width || 0),
    Number(mediaSize?.width || 0),
  );
  const baseRenderHeight = Math.max(
    editableHeight,
    Number(canvasSize?.height || 0),
    Number(mediaSize?.height || 0),
  );
  const renderWidth = baseRenderWidth * displayZoom;
  const renderHeight = baseRenderHeight * displayZoom;

  if (!renderWidth || !renderHeight) {
    return null;
  }

  return {
    id: String((display as { id?: string }).id || ''),
    name: display.name || '',
    kind: 'size',
    x,
    y,
    rotation,
    displayZoom,
    renderWidth,
    renderHeight,
    widthOffset: Math.max(0, baseRenderWidth - Math.max(1, editableWidth)),
    heightOffset: Math.max(0, baseRenderHeight - Math.max(1, editableHeight)),
    fixedAspect: keepsAspect ? fixedAspect : false,
    heightIncludesShadow,
    size,
    barHeight: Math.max(0, heightProperty),
    barShadowHeight: heightIncludesShadow ? shadowHeightProperty : 0,
    radius: 0,
    innerRadius: 0,
    amplitude: 0,
    lineWidth: 0,
  };
}

export function isTransformable2DDisplay(display?: TransformableDisplay | null): boolean {
  // Based on the display *type*, not its current content: a text layer stays
  // transformable (toggle enabled, mode kept on) even while empty. Whether any
  // handles actually draw is decided separately by getDisplayTransformFrame.
  return (
    !!display &&
    display.enabled !== false &&
    display.type === 'display' &&
    !hasDisplayCamera(display)
  );
}
