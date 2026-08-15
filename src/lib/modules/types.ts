export type ModuleType = 'display' | 'effect';
export type ModuleRuntime = 'shader' | 'worker';

export interface ModuleFFTConfig {
  bins: number;
  minFrequency: number;
  maxFrequency: number;
  smoothing: number;
  minDecibels: number;
  maxDecibels: number;
}

export interface ModuleTDConfig {
  samples: number;
}

export interface ModuleAudioConfig {
  fft?: ModuleFFTConfig;
  td?: ModuleTDConfig;
}

export type ModuleUniformType = 'float' | 'int' | 'vec2' | 'vec3' | 'vec4' | 'color';

export interface ModuleUniformDef {
  type: ModuleUniformType;
  from: string | string[];
}

export interface ModuleManifest {
  api: number;
  name: string;
  version: string;
  label: string;
  description?: string;
  author?: string;
  homepage?: string;
  type: ModuleType;
  runtime: ModuleRuntime;
  entry?: string;
  shader?: string;
  icon?: string;
  permissions: string[];
  audio?: ModuleAudioConfig;
  defaultProperties: Record<string, unknown>;
  controls: Record<string, Record<string, unknown>>;
  uniforms?: Record<string, ModuleUniformDef>;
}

export interface InstalledModule {
  manifest: ModuleManifest;
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

export interface ModulePackage {
  manifest: ModuleManifest;
  sourceUrl: string;
  files: Record<string, string>;
  integrity: Record<string, string>;
}

// The frame object handed to worker display modules each rendered frame.
export interface ModuleFrame {
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
  type: ModuleType;
  external: true;
  icon?: string;
  module: {
    url: string;
    version: string;
    runtime: ModuleRuntime;
  };
  defaultProperties: Record<string, unknown>;
  controls: Record<string, Record<string, unknown>>;
}

export type LibraryEntityClass = (new (
  properties?: Record<string, unknown>,
) => unknown) & { config: ExternalEntityConfig };
