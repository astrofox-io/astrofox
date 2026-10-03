import React from 'react';
import {
  Color,
  DataTexture,
  FloatType,
  LinearSRGBColorSpace,
  RedFormat,
  type ShaderMaterial,
} from 'three';
import { FFT_SIZE } from '@/app/constants';
import FFTParser from '@/lib/audio/FFTParser';
import { toRadians } from '../constants';
import type { BaseDisplayLayerProps } from '../renderTypes';
import { barFragmentShader, barVertexShader } from './barSpectrumShader';

type BarProperties = {
  width?: number;
  height?: number;
  minHeight?: number;
  barWidth?: number;
  barSpacing?: number;
  shadowHeight?: number;
  color?: string | string[];
  shadowColor?: string | string[];
  fftSize?: number;
  x?: number;
  y?: number;
  rotation?: number;
  zoom?: number;
  opacity?: number;
};

function getColors(value: string | string[]) {
  const stops = Array.isArray(value) ? value : [value];
  // Canvas gradients interpolate sRGB components. Decode after interpolation
  // in the shader so the existing presets keep their colors.
  return (stops.length ? stops : ['#FFFFFF']).map(color =>
    new Color().setStyle(color, LinearSRGBColorSpace),
  );
}

export function BarSpectrumDisplayLayer({
  display,
  order,
  frameData,
}: BaseDisplayLayerProps<BarProperties>) {
  const { properties = {} } = display;
  const {
    width = 300,
    height = 100,
    minHeight = 0,
    shadowHeight = 100,
    color = '#FFFFFF',
    shadowColor = '#CCCCCC',
    fftSize = FFT_SIZE,
    x = 0,
    y = 0,
    rotation = 0,
    zoom = 1,
    opacity = 1,
  } = properties;
  const parser = React.useMemo(() => new FFTParser(), []);
  const materialRef = React.useRef<ShaderMaterial>(null);
  // Capacity follows the FFT configuration, never the display dimensions or
  // selected frequency range. Resizing the bars only changes uniforms.
  const capacity = Math.max(1, Math.ceil(fftSize / 2));
  const spectrum = React.useMemo(
    () => new DataTexture(new Float32Array(capacity), capacity, 1, RedFormat, FloatType),
    [capacity],
  );
  const colorKey = JSON.stringify(color);
  const shadowColorKey = JSON.stringify(shadowColor);
  const colors = React.useMemo(() => getColors(color), [colorKey]);
  const shadowColors = React.useMemo(() => getColors(shadowColor), [shadowColorKey]);
  const defines = React.useMemo(
    () => ({ BAR_COLOR_COUNT: colors.length, SHADOW_COLOR_COUNT: shadowColors.length }),
    [colors.length, shadowColors.length],
  );
  const uniforms = React.useMemo(
    () => ({
      spectrum: { value: spectrum },
      spectrumWidth: { value: capacity },
      binCount: { value: 0 },
      displayWidth: { value: 0 },
      barHeight: { value: 0 },
      shadowHeight: { value: 0 },
      minHeight: { value: 0 },
      barWidth: { value: 0 },
      barPitch: { value: 1 },
      binStep: { value: 1 },
      opacity: { value: 1 },
      colors: { value: colors },
      shadowColors: { value: shadowColors },
    }),
    [spectrum],
  );

  React.useLayoutEffect(() => {
    parser.update(properties);
    const bins = Math.max(0, Math.min(capacity, parser.totalBins));
    const data = spectrum.image.data!;
    if (frameData?.fft && bins > 0) {
      data.set(parser.parseFFT(frameData.fft).subarray(0, bins));
    } else {
      data.fill(0);
    }
    spectrum.needsUpdate = true;

    let { barWidth = -1, barSpacing = -1 } = properties;
    const count = Math.max(1, bins);
    if (barWidth < 0 && barSpacing < 0) {
      barWidth = width / count / 2;
      barSpacing = barWidth;
    } else if (barSpacing >= 0 && barWidth < 0) {
      barWidth = (width - count * barSpacing) / count;
      if (barWidth <= 0) barWidth = 1;
    } else if (barWidth > 0 && barSpacing < 0) {
      barSpacing = (width - count * barWidth) / count;
      if (barSpacing <= 0) barSpacing = 1;
    }
    const pitch = Math.max(0, barWidth + barSpacing);

    // R3F copies uniform descriptors when applying props. Update the material's
    // live uniforms, not the initialization object passed through JSX.
    const liveUniforms = materialRef.current?.uniforms;
    if (!liveUniforms) return;
    liveUniforms.spectrum.value = spectrum;
    liveUniforms.spectrumWidth.value = capacity;
    liveUniforms.binCount.value = bins;
    liveUniforms.displayWidth.value = Math.max(0, width);
    liveUniforms.barHeight.value = Math.max(0, height);
    liveUniforms.shadowHeight.value = Math.max(0, shadowHeight);
    liveUniforms.minHeight.value = Math.max(0, minHeight);
    liveUniforms.barWidth.value = Math.max(0, barWidth);
    liveUniforms.barPitch.value = Math.max(0.0001, pitch);
    // Match CanvasBars' sampling when explicit widths exceed the available width.
    liveUniforms.binStep.value = width > 0 ? Math.max(1, (pitch * count) / width) : 1;
    liveUniforms.opacity.value = Math.max(0, Math.min(1, opacity));
    liveUniforms.colors.value = colors;
    liveUniforms.shadowColors.value = shadowColors;
  });

  React.useEffect(() => () => spectrum.dispose(), [spectrum]);

  return (
    <mesh
      position={[x, -y, 0]}
      rotation={[0, 0, -toRadians(rotation)]}
      scale={[Math.max(1, width) * zoom, Math.max(1, height + shadowHeight) * zoom, 1]}
      renderOrder={order}
      visible={width > 0 && height + shadowHeight > 0}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        key={`${colors.length}:${shadowColors.length}`}
        ref={materialRef}
        uniforms={uniforms}
        defines={defines}
        vertexShader={barVertexShader}
        fragmentShader={barFragmentShader}
        transparent={true}
        premultipliedAlpha={false}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
