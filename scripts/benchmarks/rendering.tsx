// Standalone benchmark entry, bundled by benchmark-rendering.mjs (not the app).

import { RadialSpectrumDisplayLayer as OldRadial } from 'baseline:RadialSpectrumDisplayLayer';
import { ShapeDisplayLayer as OldShape } from 'baseline:ShapeDisplayLayer';
import { SoundWaveDisplayLayer as OldSound } from 'baseline:SoundWaveDisplayLayer';
import { WaveformRingDisplayLayer as OldRing } from 'baseline:WaveformRingDisplayLayer';
import { WaveSpectrumDisplayLayer as OldSpectrum } from 'baseline:WaveSpectrumDisplayLayer';
import { createRoot, extend, flushSync } from '@react-three/fiber';
import * as THREE from 'three';
import { RadialSpectrumDisplayLayer } from '@/lib/core/render/layers/RadialSpectrumDisplayLayer';
import { ShapeDisplayLayer } from '@/lib/core/render/layers/ShapeDisplayLayer';
import { SoundWaveDisplayLayer } from '@/lib/core/render/layers/SoundWaveDisplayLayer';
import { WaveformRingDisplayLayer } from '@/lib/core/render/layers/WaveformRingDisplayLayer';
import { WaveSpectrumDisplayLayer } from '@/lib/core/render/layers/WaveSpectrumDisplayLayer';

const { ipcRenderer } = window.require('electron');
const clock = window.require('node:perf_hooks').performance;
const errors: string[] = [];
const originalError = console.error;
console.error = (...args) => {
  errors.push(args.map(String).join(' '));
  originalError(...args);
};
extend(THREE);

const components = [
  ['shape', OldShape, ShapeDisplayLayer],
  ['radial', OldRadial, RadialSpectrumDisplayLayer],
  ['spectrum', OldSpectrum, WaveSpectrumDisplayLayer],
  ['sound', OldSound, SoundWaveDisplayLayer],
  ['ring', OldRing, WaveformRingDisplayLayer],
] as const;
const common = {
  x: 0,
  y: 0,
  zoom: 1,
  rotation: 0,
  opacity: 1,
  fftSize: 1024,
  sampleRate: 44100,
  minDecibels: -100,
  maxDecibels: -12,
  minFrequency: 0,
  maxFrequency: 6000,
  smoothingTimeConstant: 0,
};

function properties(name: string, large: boolean, resize: boolean, frame: number) {
  const scale = (large ? 2 : 1) * (resize ? 0.8 + 0.2 * Math.sin(frame * 0.17) : 1);
  const width = Math.round(770 * scale),
    height = Math.round(240 * scale);
  if (name === 'shape')
    return {
      ...common,
      shape: 'Hexagon',
      width: Math.round(300 * scale),
      fill: true,
      color: '#a077ee',
      stroke: true,
      strokeColor: '#FFFFFF',
      strokeWidth: 4,
    };
  if (name === 'radial')
    return {
      ...common,
      radius: Math.round(150 * scale),
      innerRadius: Math.round(80 * scale),
      barCount: 64,
      barWidth: 4 * scale,
      mirror: true,
      shadowLength: 0.5,
      color: ['#64adff', '#FFFFFF'],
      shadowColor: ['#555555', '#000000'],
    };
  if (name === 'ring')
    return {
      ...common,
      radius: Math.round(140 * scale),
      amplitude: Math.round(60 * scale),
      sampleCount: 256,
      smooth: true,
      stroke: true,
      strokeColor: '#FFFFFF',
      lineWidth: 2,
      fill: true,
      fillColor: ['#294060', '#64adff'],
    };
  return {
    ...common,
    width,
    height,
    midpoint: name === 'spectrum' ? height : height / 2,
    stroke: true,
    strokeColor: '#FFFFFF',
    lineWidth: 2,
    fill: name === 'spectrum',
    fillColor: ['#294060', '#64adff'],
    taper: name === 'spectrum',
    wavelength: 0,
  };
}

function frameData(index: number) {
  const fft = new Uint8Array(512);
  const td = new Float32Array(1024);
  for (let i = 0; i < fft.length; i++)
    fft[i] = Math.round(185 + 50 * Math.sin(i * 0.12 + index * 0.05) * Math.exp(-i / 220));
  for (let i = 0; i < td.length; i++)
    td[i] = 0.45 * Math.sin(i * 0.06 + index * 0.08) + 0.2 * Math.sin(i * 0.173);
  return {
    id: index,
    time: index / 60,
    delta: 1000 / 60,
    fps: 60,
    duration: 30,
    fft,
    td,
    volume: 0.5,
    gain: 1,
    audioPlaying: true,
    hasUpdate: true,
    playing: true,
    offline: true,
    reactors: {},
  };
}

function percentile(values: number[], fraction: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

async function run() {
  const canvas = document.getElementById('stage') as HTMLCanvasElement;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.NoToneMapping;
  const gl = renderer.getContext();
  const gpu = gl.getExtension('WEBGL_debug_renderer_info');
  const hardware = gpu
    ? gl.getParameter(gpu.UNMASKED_RENDERER_WEBGL)
    : gl.getParameter(gl.RENDERER);
  const root = createRoot(canvas);
  let uploadedBytes = 0,
    allocations = 0;
  for (const name of [
    'texImage2D',
    'texSubImage2D',
    'bufferData',
    'bufferSubData',
    'texStorage2D',
    'renderbufferStorageMultisample',
  ]) {
    const original = gl[name].bind(gl);
    gl[name] = (...args) => {
      if (name === 'texStorage2D' || name === 'renderbufferStorageMultisample') allocations++;
      if (name === 'texImage2D' || name === 'texSubImage2D') {
        const source = args[args.length - 1];
        if (source instanceof HTMLCanvasElement || source instanceof OffscreenCanvas)
          uploadedBytes += source.width * source.height * 4;
        else if (ArrayBuffer.isView(source)) uploadedBytes += source.byteLength;
      } else if (name === 'bufferData' || name === 'bufferSubData') {
        const index = name === 'bufferData' ? 1 : 2;
        const data = args[index];
        if (ArrayBuffer.isView(data)) {
          const count = args[index + 2];
          uploadedBytes += count ? count * data.BYTES_PER_ELEMENT : data.byteLength;
        }
      }
      return original(...args);
    };
  }
  const cases = [];
  const fencePixel = new Uint8Array(4);
  const fixtures = Array.from({ length: 160 }, (_, i) => frameData(i));
  for (const [width, height] of [
    [854, 480],
    [1920, 1080],
  ]) {
    const state = await root.configure({
      gl: renderer,
      frameloop: 'never',
      dpr: 1,
      flat: true,
      orthographic: true,
      camera: { position: [0, 0, 10], near: -1000, far: 1000 },
      size: { width, height, top: 0, left: 0 },
    });
    const store = state.render(null);
    await new Promise(resolve => setTimeout(resolve, 50));
    for (const [name, before, after] of components) {
      for (const resize of [false, true]) {
        // Alternate order between workloads to reduce warmup/order bias.
        const versions = resize
          ? [
              ['gpu', after],
              ['canvas', before],
            ]
          : [
              ['canvas', before],
              ['gpu', after],
            ];
        for (const [runIndex, [version, Component]] of [
          ...versions,
          ...[...versions].reverse(),
          ...versions,
        ].entries()) {
          flushSync(() => root.render(null));
          const cpu: number[] = [],
            completed: number[] = [];
          let bytes = 0,
            allocs = 0;
          for (let i = 0; i < 150; i++) {
            const props = properties(name, width > 1000, resize, i);
            const bytesBefore = uploadedBytes,
              allocationsBefore = allocations;
            const start = clock.now();
            flushSync(() =>
              root.render(
                <Component display={{ properties: props }} order={1} frameData={fixtures[i]} />,
              ),
            );
            const current = store.getState();
            renderer.render(current.scene, current.camera);
            const submitted = clock.now();
            gl.finish();
            // WebGL finish alone can return before the GPU process has finished.
            // A synchronous readback forces completion of the submitted frame.
            gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, fencePixel);
            const end = clock.now();
            if (i >= 30) {
              cpu.push(submitted - start);
              completed.push(end - start);
              bytes += uploadedBytes - bytesBefore;
              allocs += allocations - allocationsBefore;
            }
          }
          const label = `${name}-${width}-${resize ? 'resize' : 'steady'}-${version}`;
          const pixels = new Uint8Array(width * height * 4);
          gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          let visible = 0;
          for (let i = 0; i < pixels.length; i += 4)
            if (Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) > 8) visible++;
          if (!visible) throw new Error(`${label} rendered no visible pixels`);
          ipcRenderer.send('snapshot', { name: label, data: canvas.toDataURL() });
          const result = {
            name,
            width,
            height,
            resize,
            version,
            repeat: Math.floor(runIndex / 2) + 1,
            frames: cpu.length,
            cpuMedianMs: percentile(cpu, 0.5),
            cpuP95Ms: percentile(cpu, 0.95),
            completedMedianMs: percentile(completed, 0.5),
            completedP95Ms: percentile(completed, 0.95),
            uploadBytesPerFrame: bytes / cpu.length,
            allocationsPerFrame: allocs / cpu.length,
            visiblePixels: visible,
          };
          cases.push(result);
          ipcRenderer.send(
            'progress',
            `${label}: ${result.completedMedianMs.toFixed(3)} ms, ${(result.uploadBytesPerFrame / 1024).toFixed(1)} KiB/frame`,
          );
          // Let IPC and the OS process events between workloads, outside measurements.
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
    }
  }
  const qa = [];
  const configured = await root.configure({ size: { width: 854, height: 480, top: 0, left: 0 } });
  const qaStore = configured.render(null);
  const variants: [string, Record<string, unknown>][] = [
    ['shape', { shape: 'Circle', fill: false, strokeWidth: 16 }],
    ['shape', { shape: 'Triangle', opacity: 0.4, rotation: 33 }],
    ['shape', { shape: 'Rectangle', width: 390, height: 150, strokeWidth: 12 }],
    ['shape', { fill: false, stroke: false }],
    [
      'radial',
      {
        mirror: false,
        barCount: 12,
        barWidth: 12,
        innerRadius: 20,
        shadowLength: 1.5,
        opacity: 0.4,
      },
    ],
    ['radial', { innerRadius: 0 }],
    ['radial', { shadowLength: 0, barCount: 256, rotation: 17 }],
    ['spectrum', { fill: false, lineWidth: 8, taper: false, maxFrequency: 15000 }],
    ['spectrum', { minFrequency: 100, maxFrequency: 100 }],
    ['sound', { wavelength: 0.12, fill: true, taper: true, opacity: 0.4, lineWidth: 6 }],
    ['sound', { wavelength: 1, fill: true, taper: false, midpoint: 120 }],
    ['ring', { sampleCount: 16, smooth: false, fill: false, lineWidth: 16, opacity: 0.4 }],
    ['ring', { sampleCount: 32, smooth: true, amplitude: 220, radius: 40, lineWidth: 4 }],
    ['ring', { sampleCount: 2, smooth: true, fill: false, lineWidth: 4 }],
    ['spectrum', { minFrequency: 0, maxFrequency: 50, taper: false }],
  ];
  for (const [index, [name, overrides]] of variants.entries()) {
    const entry = components.find(item => item[0] === name)!;
    const outputs = [];
    for (const [version, Component] of [
      ['canvas', entry[1]],
      ['gpu', entry[2]],
    ]) {
      flushSync(() => root.render(null));
      const p = { ...properties(name, false, false, 0), ...overrides };
      flushSync(() =>
        root.render(<Component display={{ properties: p }} order={1} frameData={fixtures[42]} />),
      );
      const current = qaStore.getState();
      renderer.render(current.scene, current.camera);
      gl.finish();
      const pixels = new Uint8Array(854 * 480 * 4);
      gl.readPixels(0, 0, 854, 480, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      outputs.push(pixels);
      ipcRenderer.send('snapshot', {
        name: `qa-${index}-${name}-${version}`,
        data: canvas.toDataURL(),
      });
    }
    let drawn = 0,
      difference = 0,
      changed = 0;
    for (let i = 0; i < outputs[0].length; i += 4) {
      if (Math.max(...outputs[0].subarray(i, i + 3), ...outputs[1].subarray(i, i + 3)) <= 8)
        continue;
      drawn++;
      let maxDifference = 0;
      for (let c = 0; c < 3; c++) {
        const delta = Math.abs(outputs[0][i + c] - outputs[1][i + c]);
        difference += delta;
        maxDifference = Math.max(maxDifference, delta);
      }
      if (maxDifference > 32) changed++;
    }
    qa.push({
      index,
      name,
      overrides,
      drawnPixels: drawn,
      meanAbsoluteRgbError: drawn ? difference / (drawn * 3) : 0,
      percentPixelsAbove32Error: drawn ? (100 * changed) / drawn : 0,
    });
  }
  flushSync(() => root.render(null));
  // R3F disposes baseline JSX geometries via an idle callback.
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (errors.length) throw new Error(errors.join('\n'));
  ipcRenderer.send('result', {
    hardware,
    method:
      'Production React components; 3 repeats, each 30 warmup + 120 measured frames per case; high-resolution Node clock; CPU update/submission and synchronous 1-pixel readback timing (includes synchronization overhead). Deterministic synthetic audio; single layer; no app UI, effects, or vsync. Full-size snapshots taken outside timing.',
    cases,
    qa,
    memoryAfterUnmount: renderer.info.memory,
  });
}
run().catch(error => ipcRenderer.send('result', { error: String(error), errors }));
