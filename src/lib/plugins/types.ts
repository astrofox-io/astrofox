export type PluginType = 'display' | 'effect';
export type PluginRuntime = 'shader' | 'worker';

export interface PluginFFTConfig {
  bins: number;
  minFrequency: number;
  maxFrequency: number;
  smoothing: number;
  minDecibels: number;
  maxDecibels: number;
}

export interface PluginTDConfig {
  samples: number;
}

export interface PluginAudioConfig {
  fft?: PluginFFTConfig;
  td?: PluginTDConfig;
}

export type PluginUniformType = 'float' | 'int' | 'vec2' | 'vec3' | 'vec4' | 'color';

export interface PluginUniformDef {
  type: PluginUniformType;
  from: string | string[];
}

export interface PluginManifest {
  api: number;
  name: string;
  version: string;
  label: string;
  description?: string;
  author?: string;
  homepage?: string;
  type: PluginType;
  runtime: PluginRuntime;
  entry?: string;
  shader?: string;
  icon?: string;
  permissions: string[];
  libraries: string[];
  // Worker displays that own a 3D camera (see docs/plugin-authoring.md).
  camera?: boolean;
  audio?: PluginAudioConfig;
  defaultProperties: Record<string, unknown>;
  controls: Record<string, Record<string, unknown>>;
  uniforms?: Record<string, PluginUniformDef>;
}

export interface InstalledPlugin {
  manifest: PluginManifest;
  // URL the manifest was installed from.
  sourceUrl: string;
  installedAt: string;
  // Relative ref (as written in the manifest) -> file contents. Icons are
  // stored as data: URLs; code and shaders as text.
  files: Record<string, string>;
  // Relative ref -> "sha384-<base64>" of the stored contents.
  integrity: Record<string, string>;
  // Installed via the local dev-mode loader; integrity is not enforced.
  dev?: boolean;
}

export interface PluginPackage {
  manifest: PluginManifest;
  sourceUrl: string;
  files: Record<string, string>;
  integrity: Record<string, string>;
}

// The frame object handed to worker display plugins each rendered frame.
export interface PluginFrame {
  id: number;
  time: number;
  delta: number;
  playing: boolean;
  exporting: boolean;
  volume: number;
  seed: number;
  fft?: Float32Array;
  td?: Float32Array;
}

export interface ExternalEntityConfig {
  name: string;
  label: string;
  description: string;
  type: PluginType;
  external: true;
  icon?: string;
  plugin: {
    url: string;
    version: string;
    runtime: PluginRuntime;
  };
  defaultProperties: Record<string, unknown>;
  controls: Record<string, Record<string, unknown>>;
}

export type LibraryEntityClass = (new (
  properties?: Record<string, unknown>,
) => unknown) & { config: ExternalEntityConfig };
