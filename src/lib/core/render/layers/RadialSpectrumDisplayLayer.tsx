// @ts-nocheck
import React from 'react';
import FFTParser from '@/lib/audio/FFTParser';
import CanvasRadial from '@/lib/canvas/CanvasRadial';
import { CanvasTextureLayer } from './CanvasTextureLayer';

export function RadialSpectrumDisplayLayer({
  display,
  order,
  frameData,
  sceneOpacity,
  sceneBlendMode,
  sceneMask,
  sceneInverse,
  sceneMaskCombine,
}) {
  const radialRef = React.useRef(null);
  const parserRef = React.useRef(null);

  const drawFrame = React.useCallback(({ canvas, properties, frameData }) => {
    if (!radialRef.current) {
      radialRef.current = new CanvasRadial(properties, canvas);
    }

    if (!parserRef.current) {
      parserRef.current = new FFTParser(properties);
    }

    radialRef.current.update(properties);
    parserRef.current.update(properties);

    const bins = Math.max(1, parserRef.current.totalBins || 64);
    const fftValues = frameData?.fft
      ? parserRef.current.parseFFT(frameData.fft)
      : new Float32Array(bins);

    radialRef.current.render(fftValues);

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
