import React from 'react';
import WaveParser from '@/lib/audio/WaveParser';
import CanvasWaveRing from '@/lib/canvas/CanvasWaveRing';
import type { CanvasElement, RenderFrameData } from '@/lib/types';
import { CanvasTextureLayer } from './CanvasTextureLayer';

interface WaveformRingDisplayLayerProps {
  display: Record<string, unknown>;
  order: number;
  frameData?: RenderFrameData | null;
  sceneOpacity: number;
  sceneBlendMode: string;
  sceneMask: boolean;
  sceneInverse: boolean;
  sceneMaskCombine: string;
}

interface DrawFrameArgs {
  canvas: CanvasElement;
  properties: Record<string, unknown>;
  frameData?: RenderFrameData | null;
}

function getFallbackWaveform(size: number) {
  const values = new Float32Array(size);
  values.fill(0.5);

  return values;
}

export function WaveformRingDisplayLayer({
  display,
  order,
  frameData,
  sceneOpacity,
  sceneBlendMode,
  sceneMask,
  sceneInverse,
  sceneMaskCombine,
}: WaveformRingDisplayLayerProps) {
  const ringRef = React.useRef<CanvasWaveRing | null>(null);
  const parserRef = React.useRef<WaveParser | null>(null);

  const drawFrame = React.useCallback(({ canvas, properties, frameData }: DrawFrameArgs) => {
    if (!ringRef.current) {
      ringRef.current = new CanvasWaveRing(properties, canvas);
    }

    if (!parserRef.current) {
      parserRef.current = new WaveParser(properties);
    }

    const ring = ringRef.current;
    const parser = parserRef.current;

    ring.update(properties);
    parser.update(properties);

    const sampleCount = Math.max(2, Math.floor(Number(properties.sampleCount || 256)));
    const values = frameData?.td
      ? parser.parseTimeData(frameData.td, sampleCount)
      : getFallbackWaveform(sampleCount);

    ring.render(values);

    return {
      width: canvas.width,
      height: canvas.height,
      originX: canvas.width / 2,
      originY: canvas.height / 2,
    };
  }, []);

  return (
    <CanvasTextureLayer
      display={display}
      order={order}
      frameData={frameData}
      sceneOpacity={sceneOpacity}
      sceneBlendMode={sceneBlendMode}
      sceneMask={sceneMask}
      sceneInverse={sceneInverse}
      sceneMaskCombine={sceneMaskCombine}
      drawFrame={drawFrame}
    />
  );
}
