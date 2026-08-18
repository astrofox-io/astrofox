/**
 * Sandbox worker for worker-runtime display plugins.
 *
 * This file is copied verbatim to public/plugin-libs/sandbox.js (and
 * sandbox-net.js) by scripts/copy-plugin-libs.mjs and loaded by URL rather
 * than as a blob so the response can carry a Content-Security-Policy header
 * (see electron/plugin-sandbox-policy.mjs). The CSP is what actually blocks
 * network access (connect-src) and remote code (script-src); the runtime
 * shims below are defense in depth.
 *
 * The host posts the plugin's stored code; the plugin executes here (no DOM,
 * no desktop bridge) and draws into per-instance OffscreenCanvases. Rendered
 * frames return to the host as transferred ImageBitmaps.
 *
 * Plugins that request the "three" library do not get a canvas; instead the
 * sandbox owns ONE shared THREE.WebGLRenderer (one WebGL context per plugin,
 * configured to match the host stage) and hands it to every instance. Each
 * instance renders into it during render(); the sandbox then transfers the
 * renderer's canvas contents to the host.
 */

const instances = new Map();
let factory = null;
const libraries = {};
let messageQueue = Promise.resolve();

// Shared three.js renderer (created lazily, only when "three" is requested).
let sharedRenderer = null;
let sharedRendererCanvas = null;

function getSharedRenderer() {
  if (sharedRenderer) {
    return sharedRenderer;
  }

  const THREE = libraries.three;
  if (!THREE) {
    return null;
  }

  sharedRendererCanvas = new OffscreenCanvas(1, 1);
  sharedRenderer = new THREE.WebGLRenderer({
    canvas: sharedRendererCanvas,
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
  });
  // Match the host stage: transparent background so the layer composites,
  // sRGB output, no tone mapping (the stage renders "flat"), soft shadows.
  sharedRenderer.setClearColor(0x000000, 0);
  sharedRenderer.outputColorSpace = THREE.SRGBColorSpace;
  sharedRenderer.toneMapping = THREE.NoToneMapping;
  sharedRenderer.shadowMap.enabled = true;
  sharedRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sharedRenderer.setPixelRatio(1);

  return sharedRenderer;
}

function post(message, transfer) {
  self.postMessage(message, transfer || []);
}

function fail(instanceId, error) {
  post({
    op: 'error',
    instanceId: instanceId ?? null,
    message: String(error?.message || error),
  });
}

function disableNetwork() {
  const denied = () => {
    throw new Error('This plugin does not have the "network" permission');
  };
  try {
    self.fetch = denied;
  } catch {}
  try {
    self.XMLHttpRequest = undefined;
  } catch {}
  try {
    self.WebSocket = undefined;
  } catch {}
  try {
    self.EventSource = undefined;
  } catch {}
  try {
    self.importScripts = denied;
  } catch {}
  try {
    self.Worker = undefined;
  } catch {}
  try {
    self.SharedWorker = undefined;
  } catch {}
  try {
    self.navigator.sendBeacon = denied;
  } catch {}
}

async function handleMessage(msg) {
  switch (msg.op) {
    case 'load': {
      // Host-provided libraries (e.g. three.js) are imported by absolute
      // same-origin URL before the network is disabled; the plugin
      // receives them through the factory's "libraries" argument.
      for (const lib of msg.libraries || []) {
        libraries[lib.name] = await import(lib.url);
      }

      if (!msg.permissions?.includes('network')) {
        disableNetwork();
      }

      const blob = new Blob([msg.code], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const mod = await import(url);
      URL.revokeObjectURL(url);

      factory = mod.default;
      if (typeof factory !== 'function') {
        throw new Error('Plugin entry must default-export a factory function');
      }

      post({ op: 'loaded' });
      break;
    }

    case 'create': {
      const size = msg.size || {};
      const width = Math.max(1, size.width || 1);
      const height = Math.max(1, size.height || 1);
      const renderer = libraries.three ? getSharedRenderer() : null;
      // three.js plugins draw through the shared renderer; everything else
      // gets its own 2D-capable OffscreenCanvas.
      const canvas = renderer ? null : new OffscreenCanvas(width, height);
      const instance = factory({
        properties: msg.properties || {},
        seed: msg.seed || 0,
        size: { width, height },
        libraries,
        renderer,
      });

      if (instance && typeof instance.init === 'function') {
        instance.init(renderer ? { renderer, size: { width, height } } : { canvas });
      }

      instances.set(msg.instanceId, { instance, canvas, usesRenderer: Boolean(renderer) });
      break;
    }

    case 'update': {
      const record = instances.get(msg.instanceId);
      if (record && typeof record.instance.update === 'function') {
        record.instance.update(msg.properties || {});
      }
      break;
    }

    case 'resize': {
      const record = instances.get(msg.instanceId);
      if (record && msg.size) {
        if (record.canvas) {
          record.canvas.width = Math.max(1, msg.size.width || 1);
          record.canvas.height = Math.max(1, msg.size.height || 1);
        }
        if (typeof record.instance.resize === 'function') {
          record.instance.resize(msg.size);
        }
      }
      break;
    }

    case 'frame': {
      const record = instances.get(msg.instanceId);
      if (!record) {
        throw new Error('Plugin instance is not initialized');
      }

      let box = null;
      if (typeof record.instance.render === 'function') {
        box = record.instance.render(msg.frame) || null;
      }

      // Shared-renderer plugins leave their frame in the renderer's canvas;
      // transferring it out also clears it for the next instance.
      const source = record.usesRenderer ? sharedRendererCanvas : record.canvas;
      const bitmap = source.transferToImageBitmap();
      post(
        {
          op: 'frame-done',
          instanceId: msg.instanceId,
          frameId: msg.frame?.id,
          box,
          bitmap,
        },
        [bitmap],
      );
      break;
    }

    case 'dispose': {
      const record = instances.get(msg.instanceId);
      if (record && typeof record.instance.dispose === 'function') {
        record.instance.dispose();
      }
      instances.delete(msg.instanceId);
      break;
    }
  }
}

self.onmessage = event => {
  const msg = event.data || {};
  messageQueue = messageQueue
    .then(() => handleMessage(msg))
    .catch(error => fail(msg.instanceId, error));
};
