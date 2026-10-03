# Display rendering benchmark

Run from the repository root with dependencies installed:

```powershell
node scripts/benchmark-rendering.mjs --output coverage/render-benchmark-results
```

The runner bundles the real React display components from the working tree and
from commit `63971980224ed229e67f924c563fe08470f6a4d4`. Override the comparison
revision with `--baseline <revision>`. Both versions share the installed React,
R3F, and Three.js packages. The benchmark opens a hidden Electron renderer; it
does not start or change the development server or the user's project.

The output directory contains `environment.json`, `results.json`, and PNGs of
each workload and visual comparison. Keep this output under `coverage/` so it
is ignored by git and excluded from desktop packaging.

## Implementation

Shape uses an analytic distance-field fragment shader. Radial Spectrum uses
instanced rectangles with shader positioning, coverage, and gradients. Wave
Spectrum, Sound Wave, and Waveform Ring upload reusable vertex/instance buffers
and use GLSL materials for color and stroke coverage. Audio parsing and curve
subdivision remain on the CPU. None of these five layers rasterizes a canvas or
uploads a canvas bitmap.

The curves and radial spectrum use a GPU-only intermediate to preserve the
existing fill/stroke/shadow ordering and apply layer opacity after overlapping
primitives have been combined. Target capacity grows in 128-pixel blocks and is
retained on shrink. Growth beyond the retained capacity still allocates storage;
ordinary resizing within that capacity does not. Shape needs no intermediate.

This trades GPU memory for less CPU work and upload traffic. Each intermediate
uses RGBA16F and four MSAA samples: approximately 40 bytes per capacity pixel
including the resolved texture, before driver overhead. A 1024-square target
therefore uses approximately 40 MiB. Targets and geometry are disposed when the
layer unmounts. This is not a claim of lower total memory use.

## Method

- Production React bundle, actual old/new components, deterministic FFT and
  time-domain fixtures prepared outside the measured region.
- 854×480 and 1920×1080 viewports, one layer at a time, fixed size and animated
  size. The larger viewport uses twice the layer dimensions. This does not mean
  each layer fills the whole viewport.
- Three repeats per version/workload, each with 30 warmup and 120 measured
  frames. Version order alternates across repeats.
- `cpuMedianMs` measures the synchronous React update, parsing, drawing or
  geometry preparation, and WebGL submission using Node's high-resolution clock.
- `completedMedianMs` also includes `gl.finish()` and a synchronous one-pixel
  readback. The readback forces GPU completion; its overhead is included in both
  versions. These are serialized layer timings, not GPU timer-query durations or
  application FPS.
- Upload counts intercept canvas texture uploads and populated geometry buffer
  uploads. They exclude uniforms, driver-internal copies, and GPU-local target
  writes/resolves. Allocation counts intercept texture storage and multisample
  renderbuffer storage calls, not all JavaScript or driver allocations.
- Full screenshots are captured outside timing. The fixture includes mirrored
  radial bars and shadows, gradients, a filled smooth spectrum, a dense sound
  waveform, and a filled smooth ring.
- Visual comparisons cover the four shapes, disabled fill/stroke, transforms,
  opacity, radial overlap, zero inner radius, dense bars, empty and one-bin
  frequency ranges, tapered/sparse waves, and sparse/distorted/two-sample rings.

Application UI, effects, multiple-layer compositing, video export, vsync, and
other GPUs are outside this benchmark. Timing varies with system load; the
tables report the median of the three repeat medians. P95 values are likewise
the median of the three repeat P95 values.

## Results: 2026-10-03 UTC

Windows 11 (build 26220), AMD Ryzen 9 5950X, NVIDIA RTX 3090 through ANGLE/D3D11;
Electron 39.8.10, Three.js 0.184.0, R3F 9.8.0, React 19.3.0. Raw measurements and
screenshots for this run are in `coverage/render-benchmark-results/`.

1920×1080, fixed layer dimensions; time includes the completion readback:

| Display | Canvas median ms | GPU median ms | Ratio | Canvas KiB/frame | GPU KiB/frame |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shape | 4.180 | 0.641 | 6.5× | 1444.0 | 0.0 |
| Radial Spectrum | 10.719 | 1.200 | 8.9× | 3335.1 | 3.0 |
| Wave Spectrum | 7.307 | 1.218 | 6.0× | 2887.5 | 88.7 |
| Sound Wave | 8.178 | 1.291 | 6.3× | 2887.5 | 144.3 |
| Waveform Ring | 7.461 | 1.313 | 5.7× | 2550.3 | 68.1 |

The corresponding canvas/GPU P95 times were 5.381/1.783, 13.143/2.272,
9.042/2.463, 9.550/2.238, and 9.072/2.377 ms. Measured uploads fell by
95.0–100%; the remaining uploads contain geometry or bar attributes.

1920×1080, animated layer dimensions:

| Display | Canvas median ms | GPU median ms | Ratio |
| --- | ---: | ---: | ---: |
| Shape | 3.562 | 0.599 | 6.0× |
| Radial Spectrum | 8.433 | 0.993 | 8.5× |
| Wave Spectrum | 6.317 | 0.973 | 6.5× |
| Sound Wave | 7.237 | 0.935 | 7.7× |
| Waveform Ring | 6.515 | 1.093 | 6.0× |

All GPU cases recorded zero storage allocation calls during measured frames.
The resize warmup had already established the required capacity. The canvas
versions averaged 0.975–1.000 storage allocation calls per measured frame.

854×480, smaller layer dimensions:

| Display | Fixed canvas/GPU ms | Resizing canvas/GPU ms |
| --- | ---: | ---: |
| Shape | 1.173 / 0.521 | 1.169 / 0.437 |
| Radial Spectrum | 5.223 / 0.744 | 5.032 / 0.707 |
| Wave Spectrum | 2.723 / 0.906 | 2.862 / 0.864 |
| Sound Wave | 2.986 / 0.912 | 2.964 / 0.841 |
| Waveform Ring | 3.034 / 0.962 | 3.060 / 0.922 |

All 120 timed runs produced visible output. The 15 visual comparisons completed
without renderer errors; intentionally empty displays remained empty. After
unmounting and allowing R3F's deferred disposal to run, Three.js reported zero
remaining geometries and textures. TypeScript and Biome checks also passed.

## Visual compatibility

The new paths preserve existing placement, color interpolation, gradient
coordinates, smoothing control points, and opacity behavior. Pixel equality is
not expected: canvas and shader/MSAA antialiasing differ. The comparison output
records mean absolute RGB error and the fraction of drawn pixels with any
channel differing by more than 32/255. These metrics exclude black background.
Thin outlines therefore make edge differences look large as a percentage.

The deliberately distorted ring and densely packed radial bars retain visible
edge differences. Curves are adaptively flattened with a 0.15-layer-pixel
flatness tolerance and a subdivision-depth limit. The PNGs should be inspected
alongside the metrics when changing tessellation or antialiasing.
