import FFTParser from '@/lib/audio/FFTParser';
import WaveParser from '@/lib/audio/WaveParser';
import type { RenderFrameData } from '@/lib/types';
import { resolvePluginLibraries, resolveSandboxWorkerUrl } from './libraries';
import type { InstalledPlugin, PluginFrame } from './types';

const EXPORT_FRAME_TIMEOUT_MS = 5000;
const LIVE_FRAME_TIMEOUT_MS = 3000;
const VIDEO_RENDERING = -1;

interface FrameBox {
  originX?: number;
  originY?: number;
}

interface RenderedFrame {
  bitmap: ImageBitmap;
  box: FrameBox | null;
}

interface InstanceRecord {
  id: string;
  created: boolean;
  seed: number;
  time: number;
  fftParser: FFTParser | null;
  waveParser: WaveParser | null;
  lastPropertiesJson: string;
  pending: boolean;
  pendingSince: number;
  pendingResolvers: (() => void)[];
  latest: RenderedFrame | null;
  failed: boolean;
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Host side of a worker-runtime display plugin. One worker per plugin
 * definition; one instance record per stage element. All audio parsing
 * happens here (per the manifest's audio block) so plugins receive small,
 * pre-normalized arrays and the offline export path is identical to live
 * rendering from the plugin's point of view.
 */
export class PluginWorkerHost {
  installed: InstalledPlugin;
  worker: Worker | null = null;
  workerFailed = false;
  instances = new Map<string, InstanceRecord>();

  constructor(installed: InstalledPlugin) {
    this.installed = installed;
  }

  ensureWorker(): Worker | null {
    if (this.worker || this.workerFailed) {
      return this.worker;
    }

    const { manifest } = this.installed;
    const entry = manifest.entry ? this.installed.files[manifest.entry] : null;

    if (typeof entry !== 'string' || !entry.trim()) {
      this.workerFailed = true;
      console.error(`Plugin ${manifest.name} is missing its entry code`);
      return null;
    }

    try {
      // Loaded by same-origin URL (not blob:) so the script response carries
      // the sandbox CSP that blocks network access and remote code.
      this.worker = new Worker(resolveSandboxWorkerUrl(manifest.permissions || []), {
        type: 'module',
        name: `plugin:${manifest.name}`,
      });
    } catch (e) {
      this.workerFailed = true;
      console.error(`Failed to start worker for plugin ${manifest.name}:`, e);
      return null;
    }

    this.worker.onmessage = event => this.handleMessage(event.data);
    this.worker.onerror = event => {
      console.error(`Plugin ${manifest.name} worker error:`, event.message);
      this.failAll();
    };

    this.worker.postMessage({
      op: 'load',
      code: entry,
      permissions: manifest.permissions || [],
      libraries: resolvePluginLibraries(manifest.libraries || []),
    });

    return this.worker;
  }

  private handleMessage(msg: {
    op: string;
    instanceId?: string;
    box?: FrameBox | null;
    bitmap?: ImageBitmap;
    message?: string;
  }) {
    if (msg.op === 'frame-done' && msg.instanceId) {
      const record = this.instances.get(msg.instanceId);
      if (!record) {
        msg.bitmap?.close();
        return;
      }

      record.latest?.bitmap.close();
      record.latest = msg.bitmap ? { bitmap: msg.bitmap, box: msg.box ?? null } : null;
      this.settlePending(record);
      return;
    }

    if (msg.op === 'error') {
      console.error(`Plugin ${this.installed.manifest.name} error:`, msg.message);
      if (msg.instanceId) {
        const record = this.instances.get(msg.instanceId);
        if (record) {
          record.failed = true;
          this.settlePending(record);
        }
      }
    }
  }

  private settlePending(record: InstanceRecord) {
    record.pending = false;
    record.pendingSince = 0;
    const resolvers = record.pendingResolvers;
    record.pendingResolvers = [];
    for (const resolve of resolvers) {
      resolve();
    }
  }

  private failAll() {
    for (const record of this.instances.values()) {
      record.failed = true;
      this.settlePending(record);
    }
  }

  ensureInstance(id: string, properties: Record<string, unknown>) {
    let record = this.instances.get(id);
    if (record) {
      return record;
    }

    const worker = this.ensureWorker();
    const { manifest } = this.installed;

    record = {
      id,
      created: false,
      seed: hashSeed(id),
      time: 0,
      fftParser: manifest.audio?.fft
        ? new FFTParser({
            minFrequency: manifest.audio.fft.minFrequency,
            maxFrequency: manifest.audio.fft.maxFrequency,
            smoothingTimeConstant: manifest.audio.fft.smoothing,
            minDecibels: manifest.audio.fft.minDecibels,
            maxDecibels: manifest.audio.fft.maxDecibels,
          })
        : null,
      waveParser: manifest.audio?.td ? new WaveParser() : null,
      lastPropertiesJson: JSON.stringify(properties ?? {}),
      pending: false,
      pendingSince: 0,
      pendingResolvers: [],
      latest: null,
      failed: !worker,
    };

    this.instances.set(id, record);

    if (worker) {
      const width = Math.max(1, Math.round(Number(properties?.width) || 512));
      const height = Math.max(1, Math.round(Number(properties?.height) || 512));

      worker.postMessage({
        op: 'create',
        instanceId: id,
        properties: structuredClone(properties ?? {}),
        seed: record.seed,
        size: { width, height },
      });
      record.created = true;
    }

    return record;
  }

  updateInstance(id: string, properties: Record<string, unknown>) {
    const record = this.instances.get(id);
    if (!record?.created || record.failed || !this.worker) {
      return;
    }

    const json = JSON.stringify(properties ?? {});
    if (json === record.lastPropertiesJson) {
      return;
    }

    record.lastPropertiesJson = json;
    this.worker.postMessage({
      op: 'update',
      instanceId: id,
      properties: JSON.parse(json),
    });
  }

  private buildFrame(record: InstanceRecord, frameData: RenderFrameData): PluginFrame {
    const { manifest } = this.installed;
    const exporting = frameData.id === VIDEO_RENDERING;

    if (frameData.hasUpdate) {
      record.time += (frameData.delta || 0) / 1000;
    }

    const frame: PluginFrame = {
      id: frameData.id,
      time: record.time,
      delta: frameData.delta,
      playing: frameData.audioPlaying,
      exporting,
      volume: frameData.volume ?? 0,
      seed: record.seed,
    };

    if (record.fftParser && frameData.fft && manifest.audio?.fft) {
      // Parser output buffers are reused; copy so the array can be transferred.
      frame.fft = new Float32Array(
        record.fftParser.parseFFT(frameData.fft, manifest.audio.fft.bins),
      );
    }

    if (record.waveParser && frameData.td && manifest.audio?.td) {
      frame.td = new Float32Array(
        record.waveParser.parseTimeData(frameData.td, manifest.audio.td.samples),
      );
    }

    return frame;
  }

  /**
   * Fire-and-forget frame request for live rendering. At most one frame is
   * in flight per instance; the stage keeps drawing the latest completed
   * bitmap, so a slow plugin lags rather than stalling the render loop.
   */
  requestFrame(id: string, frameData: RenderFrameData) {
    const record = this.instances.get(id);
    if (!record?.created || record.failed || !this.worker) {
      return;
    }

    if (record.pending) {
      if (performance.now() - record.pendingSince > LIVE_FRAME_TIMEOUT_MS) {
        console.error(`Plugin ${this.installed.manifest.name} is unresponsive; disabling instance`);
        record.failed = true;
        this.settlePending(record);
      }
      return;
    }

    const frame = this.buildFrame(record, frameData);
    const transfer: Transferable[] = [];
    if (frame.fft) {
      transfer.push(frame.fft.buffer);
    }
    if (frame.td) {
      transfer.push(frame.td.buffer);
    }

    record.pending = true;
    record.pendingSince = performance.now();
    this.worker.postMessage({ op: 'frame', instanceId: id, frame }, transfer);
  }

  /**
   * Export path: render a frame and wait for its bitmap so frame N's pixels
   * really come from frame N's audio data.
   */
  async renderFrameAndWait(id: string, frameData: RenderFrameData): Promise<void> {
    const record = this.instances.get(id);
    if (!record?.created || record.failed || !this.worker) {
      return;
    }

    if (record.pending) {
      await this.waitForPending(record);
    }

    if (record.failed) {
      return;
    }

    this.requestFrame(id, frameData);
    await this.waitForPending(record);
  }

  private waitForPending(record: InstanceRecord): Promise<void> {
    if (!record.pending) {
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      record.pendingResolvers.push(resolve);
      setTimeout(() => {
        if (record.pending) {
          record.failed = true;
          this.settlePending(record);
        }
        resolve();
      }, EXPORT_FRAME_TIMEOUT_MS);
    });
  }

  /**
   * Takes ownership of the most recently rendered frame, or null if nothing
   * new arrived since the last take. The caller must close() the bitmap.
   */
  takeRenderedFrame(id: string): RenderedFrame | null {
    const record = this.instances.get(id);
    if (!record?.latest) {
      return null;
    }

    const latest = record.latest;
    record.latest = null;
    return latest;
  }

  isInstanceFailed(id: string): boolean {
    return this.instances.get(id)?.failed ?? false;
  }

  disposeInstance(id: string) {
    const record = this.instances.get(id);
    if (!record) {
      return;
    }

    record.latest?.bitmap.close();
    this.settlePending(record);
    this.instances.delete(id);

    if (record.created && this.worker) {
      this.worker.postMessage({ op: 'dispose', instanceId: id });
    }
  }

  disposeAll() {
    for (const id of [...this.instances.keys()]) {
      this.disposeInstance(id);
    }
    this.worker?.terminate();
    this.worker = null;
    this.workerFailed = false;
  }
}

const hosts = new Map<string, PluginWorkerHost>();

export function registerPluginWorkerHost(installed: InstalledPlugin) {
  hosts.get(installed.manifest.name)?.disposeAll();
  hosts.set(installed.manifest.name, new PluginWorkerHost(installed));
}

export function unregisterPluginWorkerHost(name: string) {
  hosts.get(name)?.disposeAll();
  hosts.delete(name);
}

export function getPluginWorkerHost(name: string): PluginWorkerHost | null {
  return hosts.get(name) ?? null;
}

/**
 * Called by the export renderer before drawing each frame so worker plugins
 * contribute deterministic, frame-accurate bitmaps instead of whatever
 * rendered last.
 */
export async function renderPluginFramesForExport(frameData: RenderFrameData) {
  for (const host of hosts.values()) {
    for (const id of [...host.instances.keys()]) {
      await host.renderFrameAndWait(id, frameData);
    }
  }
}
