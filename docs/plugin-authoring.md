# Authoring External Plugins

Astrofox can load third-party **displays** and **effects** from a URL. A plugin
is a directory containing a JSON **manifest** plus a shader or a JavaScript
entry file. Users install it via *Add plugin from URL…* in the layer/effect
menus, review what it is and where it comes from, and consent before anything
is stored. Installed content is cached locally and pinned with SHA-384 hashes;
the URL is only contacted again for explicit updates.

Working examples live in [`examples/plugins/`](../examples/plugins/):

| Example | Type | Runtime | Shows |
|---|---|---|---|
| `bass-glow` | effect | shader | post-processing with audio + property uniforms |
| `plasma` | display | shader | generative fragment-shader layer with FFT array |
| `pulse-bars` | display | worker | JavaScript canvas drawing in the sandbox worker |
| `audio-orb` | display | worker | 3D scene using the host-provided three.js library |
| `cubes` | display | worker | 3D scene with `"camera": true` — host orbit controls drive the plugin's camera |

## The manifest (`astrofox.plugin.json`)

```jsonc
{
  "api": 1,                          // spec version
  "name": "@author/plugin-name",     // required namespaced id ("@a/b")
  "version": "1.0.0",
  "label": "My Plugin",              // shown in menus and the layers panel
  "description": "…",
  "author": "…",
  "type": "display",                 // "display" | "effect"
  "runtime": "shader",               // "shader" | "worker"
  "shader": "./display.frag",        // runtime "shader": fragment shader file
  "entry": "./index.js",             // runtime "worker": ES module file
  "icon": "./icon.svg",              // optional, shown in menus
  "permissions": [],                 // e.g. ["network"] — prompted at install
  "libraries": [],                   // worker runtime: e.g. ["three"] (below)
  "camera": false,                   // worker displays: expose host camera controls (below)
  "audio": { … },                    // what audio data you want (below)
  "defaultProperties": { … },
  "controls": { … },                 // control panel schema (below)
  "uniforms": { … }                  // shader runtimes: property → uniform map
}
```

Supported combinations: `effect`+`shader` (post-processing pass),
`display`+`shader` (generative layer), `display`+`worker` (JavaScript canvas
layer). File references are resolved relative to the manifest URL and must be
served over https (http is allowed for `localhost` during development).

## Audio data

Astrofox parses audio for you — declare what you want:

```jsonc
"audio": {
  "fft": {
    "bins": 64,              // number of frequency bins (1-512)
    "minFrequency": 0,       // Hz window
    "maxFrequency": 6000,
    "smoothing": 0.5,        // 0-0.99 exponential smoothing
    "minDecibels": -100,
    "maxDecibels": -12
  },
  "td": { "samples": 256 }   // time-domain (waveform) samples
}
```

FFT values arrive normalized 0..1 for the declared window; time-domain values
are 0..1 with silence at 0.5. The same parsing feeds live rendering and video
export, so your plugin renders identically in both.

## Displays: standard behavior for free

Every external display automatically gets `x`, `y`, `rotation`, `zoom` (shown as "Scale") and
`opacity` properties with controls, the on-stage transform overlay, scene
blending, and reactor support. Any control marked `withReactor: true` can be
driven by an audio reactor — Astrofox modulates the property before your
plugin sees it, so you don't handle reactors at all.

## Controls

`controls` uses Astrofox's declarative schema. Allowed types: `text`,
`number`, `toggle`, `checkbox`, `color`, `colorrange`, `range`, `select`,
`time`. Common options: `label`, `min`, `max`, `step`, `withRange` (slider),
`withReactor` (audio-reactive), `items` (for select), `hidden`.

Because manifests are JSON, live values use refs instead of functions:

```jsonc
"max":    { "$stage": "width" },              // current stage width
"min":    { "$stage": "width", "scale": -1 }, // negative stage width
"hidden": { "$prop": "autoSize" },            // another property's value
"min":    { "$prop": "minFrequency" }
```

## Shader runtimes

Your fragment shader is compiled into Astrofox's pass pipeline. Provided
uniforms (plus `varying vec2 vUv`):

```glsl
uniform sampler2D inputTexture; // effects only: the scene so far
uniform vec2 resolution;        // pass size in px
uniform float time;             // seconds, deterministic during export
uniform float delta;            // ms since last frame
uniform float volume;           // overall level 0..1
uniform float fft[N];           // displays with an audio.fft block (N = bins)
```

Each entry in `"uniforms"` maps properties into your own uniforms:

```jsonc
"uniforms": {
  "amount": { "type": "float", "from": "amount" },
  "tint":   { "type": "color", "from": "color" },        // hex → vec3
  "center": { "type": "vec2",  "from": ["x", "y"] }      // two floats → vec2
}
```

Types: `float`, `int`, `vec2`, `vec3`, `vec4`, `color`. Effects read
`inputTexture` and write `gl_FragColor`; shader displays just write
`gl_FragColor` (alpha is respected and the result is composited like any
layer).

## Worker runtime (JavaScript displays)

The entry file is an ES module that default-exports a factory. It runs in a
dedicated Web Worker — no DOM, no Astrofox internals, and no network unless
the plugin holds the `network` permission. The worker is served with a
Content-Security-Policy, so this is enforced by the browser rather than by
runtime shims: `fetch`/`XMLHttpRequest`/`WebSocket` are refused
(`connect-src 'none'`), `import()` only works for the plugin's own code and
host-provided libraries (`script-src 'self' blob:`), and nested workers are
blocked. With the `network` permission, connections are allowed but remote
code still is not — bundle everything you execute into your entry file. You
draw into an `OffscreenCanvas` you own (or, for 3D, into the host's shared
three.js renderer — see below):

```js
export default function createPlugin({ properties, seed, size }) {
  let canvas, ctx;

  return {
    init({ canvas: c }) {          // once per instance
      canvas = c;
      ctx = canvas.getContext('2d');
    },
    update(properties) {},         // properties changed (user or reactor)
    render(frame) {                // every rendered frame — draw here
      // frame: { id, time, delta, playing, exporting, volume, seed, fft?, td? }
      // Optionally return { width, height, originX, originY } to set the
      // layer's size and transform origin.
    },
    resize(size) {},
    dispose() {},
  };
}
```

Rules for correct export rendering:

- Derive all animation from `frame.time` / `frame.delta`, never wall-clock
  time. During export `delta` is fixed to `1000 / fps`.
- Use `frame.seed` (stable per instance) to seed any randomness.
- Redraw the full canvas every `render` — the backing bitmap is transferred
  to the host each frame, which leaves the canvas blank.

A frame that takes more than a few seconds marks the instance unresponsive
and stops rendering it; the app keeps running.

### Host libraries (3D with three.js)

Worker plugins can't import from the network, and bundling a 3D library into
`index.js` is heavy. Instead, ask Astrofox for the copy it already ships:

```jsonc
"runtime": "worker",
"entry": "./index.js",
"libraries": ["three"]
```

Requesting `three` gives you two things through the factory arguments:

- `libraries.three` — the `three` ES module namespace, and
- `renderer` — a **shared, host-configured `THREE.WebGLRenderer`**.

You do not create a renderer or a canvas. The sandbox owns exactly one WebGL
context per plugin and hands the same renderer to every instance, already set
up to match the stage: transparent clear colour, sRGB output, no tone mapping,
soft shadow maps, pixel ratio 1. Build your scene in `init()`, and in
`render()` size the renderer for *this* instance and draw:

```js
export default function createPlugin({ properties, seed, size, libraries, renderer }) {
  const THREE = libraries.three;
  let props = { ...properties };
  let scene, camera;

  return {
    init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 5;
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    },
    update(next) { props = { ...props, ...next }; },
    render(frame) {
      const width = props.width, height = props.height;
      renderer.setSize(width, height, false);   // shared: size it every frame
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      return { width, height };
    },
    dispose() { /* dispose your geometries/materials; not the renderer */ },
  };
}
```

Because the renderer is shared, treat it as borrowed: don't change its clear
colour, colour space, tone mapping or shadow settings, and don't call
`renderer.dispose()`. Anything you *do* set on it per frame (render targets,
scissor, autoClear…) must be reset before `render()` returns.

Available libraries: `three` (the version Astrofox itself uses; check
`libraries.three.REVISION` if you rely on newer APIs). Requested libraries are
shown to the user at install time. The result is a regular layer, exactly like
the built-in 3D displays: every 3D display owns its own scene, camera and
lighting rig and returns a bitmap. The host does not control lights; if you
want your lighting to be audio-reactive, expose the relevant values as
controls with `withReactor`. See `examples/plugins/audio-orb`.

### Exposing camera controls (`"camera": true`)

A worker display that owns a 3D camera can opt into the host's camera UX:

```jsonc
"runtime": "worker",
"libraries": ["three"],
"camera": true
```

When `camera` is set, Astrofox:

- adds three properties to the display — `cameraAzimuth`, `cameraPolar`
  (radians) and `cameraDistance` (world units; `0` = "auto") — together with a
  **Camera** control group (each control is reactor-able), and
- enables the stage's camera button for the display: dragging on the stage
  orbits (azimuth/polar) and the wheel dollies (distance). Changes are pushed
  to your plugin through `update()` live while dragging and persisted to the
  project on release.

Your plugin owns the actual `THREE.PerspectiveCamera`; just position it from
those values each frame:

```js
const cosPolar = Math.cos(props.cameraPolar);
const distance = props.cameraDistance || autoDistance; // 0 → your own default
camera.position.set(
  Math.sin(props.cameraAzimuth) * cosPolar * distance,
  Math.sin(props.cameraPolar) * distance,
  Math.cos(props.cameraAzimuth) * cosPolar * distance,
);
camera.lookAt(0, 0, 0);
```

Lighting, depth of field and everything else remain entirely up to the plugin.
See `examples/plugins/cubes` for a complete example (instanced geometry,
shadow-casting light rig, and a host-driven camera).

## Development workflow

1. From the Astrofox repository, run `pnpm dev:plugins`. This serves every
   example plugin with CORS enabled on a random available port and prints each
   manifest URL.
2. In Astrofox, open *Edit → Manage plugins*, paste one of the printed URLs,
   then review and install it. Localhost installs are flagged **dev** and skip
   integrity pinning.
3. Iterate: edit files, then *Edit → Manage plugins → Reload*.
4. Publish by hosting the same files on any https origin.

## Versioning and projects

Projects store `name`, `properties`, reactors and the plugin's source URL +
version for every external element. Opening a project with a missing plugin
shows which plugins are needed and offers installation; elements render again
once the plugin is installed and the project is reopened.
