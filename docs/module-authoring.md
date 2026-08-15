# Authoring External Modules

Astrofox can load third-party **displays** and **effects** from a URL. A module
is a directory containing a JSON **manifest** plus a shader or a JavaScript
entry file. Users install it via *Add module from URL…* in the layer/effect
menus, review what it is and where it comes from, and consent before anything
is stored. Installed content is cached locally and pinned with SHA-384 hashes;
the URL is only contacted again for explicit updates.

Working examples live in [`examples/modules/`](../examples/modules/):

| Example | Type | Runtime | Shows |
|---|---|---|---|
| `bass-glow` | effect | shader | post-processing with audio + property uniforms |
| `plasma` | display | shader | generative fragment-shader layer with FFT array |
| `pulse-bars` | display | worker | JavaScript canvas drawing in the sandbox worker |

## The manifest (`astrofox.module.json`)

```jsonc
{
  "api": 1,                          // spec version
  "name": "@author/module-name",     // required namespaced id ("@a/b")
  "version": "1.0.0",
  "label": "My Module",              // shown in menus and the layers panel
  "description": "…",
  "author": "…",
  "type": "display",                 // "display" | "effect"
  "runtime": "shader",               // "shader" | "worker"
  "shader": "./display.frag",        // runtime "shader": fragment shader file
  "entry": "./index.js",             // runtime "worker": ES module file
  "icon": "./icon.svg",              // optional, shown in menus
  "permissions": [],                 // e.g. ["network"] — prompted at install
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
export, so your module renders identically in both.

## Displays: standard behavior for free

Every external display automatically gets `x`, `y`, `rotation`, `zoom` and
`opacity` properties with controls, the on-stage transform overlay, scene
blending, and reactor support. Any control marked `withReactor: true` can be
driven by an audio reactor — Astrofox modulates the property before your
module sees it, so you don't handle reactors at all.

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
the module holds the `network` permission. You draw into an `OffscreenCanvas`
you own:

```js
export default function createModule({ properties, seed, size }) {
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

## Development workflow

1. Serve your module directory locally, e.g. `npx serve --cors .`
2. In Astrofox: *Add module from URL…* →
   `http://localhost:3000/astrofox.module.json`. Localhost installs are
   flagged **dev** and skip integrity pinning.
3. Iterate: edit files, then *Edit → Manage modules → Reload*.
4. Publish by hosting the same files on any https origin.

## Versioning and projects

Projects store `name`, `properties`, reactors and the module's source URL +
version for every external element. Opening a project with a missing module
shows which modules are needed and offers installation; elements render again
once the module is installed and the project is reopened.
