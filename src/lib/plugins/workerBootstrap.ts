/**
 * Source for the sandbox worker that runs worker-runtime display plugins.
 * The host creates a Worker from this source as a blob, then posts the
 * plugin's stored code; the plugin executes inside the worker (no DOM, no
 * desktop bridge) and draws into per-instance OffscreenCanvases. Rendered
 * frames return to the host as transferred ImageBitmaps.
 */
export const workerBootstrapSource = `
'use strict';

const instances = new Map();
let factory = null;
let readyResolve = null;
const ready = new Promise(resolve => { readyResolve = resolve; });

function post(message, transfer) {
  self.postMessage(message, transfer || []);
}

function fail(instanceId, error) {
  post({
    op: 'error',
    instanceId: instanceId ?? null,
    message: String((error && error.message) || error),
  });
}

function disableNetwork() {
  const denied = () => {
    throw new Error('This plugin does not have the "network" permission');
  };
  try { self.fetch = denied; } catch {}
  try { self.XMLHttpRequest = undefined; } catch {}
  try { self.WebSocket = undefined; } catch {}
  try { self.EventSource = undefined; } catch {}
  try { self.importScripts = denied; } catch {}
}

self.onmessage = async event => {
  const msg = event.data || {};

  try {
    switch (msg.op) {
      case 'load': {
        if (!msg.permissions || !msg.permissions.includes('network')) {
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

        readyResolve();
        post({ op: 'loaded' });
        break;
      }

      case 'create': {
        await ready;

        const size = msg.size || {};
        const canvas = new OffscreenCanvas(
          Math.max(1, size.width || 1),
          Math.max(1, size.height || 1),
        );
        const instance = factory({
          properties: msg.properties || {},
          seed: msg.seed || 0,
          size: { width: canvas.width, height: canvas.height },
        });

        if (instance && typeof instance.init === 'function') {
          instance.init({ canvas });
        }

        instances.set(msg.instanceId, { instance, canvas });
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
          record.canvas.width = Math.max(1, msg.size.width || 1);
          record.canvas.height = Math.max(1, msg.size.height || 1);
          if (typeof record.instance.resize === 'function') {
            record.instance.resize(msg.size);
          }
        }
        break;
      }

      case 'frame': {
        const record = instances.get(msg.instanceId);
        if (!record) {
          break;
        }

        let box = null;
        if (typeof record.instance.render === 'function') {
          box = record.instance.render(msg.frame) || null;
        }

        const bitmap = record.canvas.transferToImageBitmap();
        post(
          {
            op: 'frame-done',
            instanceId: msg.instanceId,
            frameId: msg.frame && msg.frame.id,
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
  } catch (error) {
    fail(msg.instanceId, error);
  }
};
`;
