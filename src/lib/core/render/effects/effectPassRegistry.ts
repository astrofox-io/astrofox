import type { RenderFrameData } from '@/lib/types';

/**
 * Registry of effect pass factories, keyed by effect name. Core effects
 * register themselves from their entity module (src/lib/effects/*), plugin
 * effects at install time. SceneWithEffects consults only this registry when
 * building a scene's pass chain, so adding an effect touches one file.
 */

// The per-scene snapshot of an effect handed to factories. `time` is the
// entity's own accumulator (see DistortionEffect.render) when it has one.
export interface EffectPassConfig {
  id: string;
  name: string;
  enabled?: boolean;
  time?: number;
  properties: Record<string, unknown>;
}

// Minimal shape SceneWithEffects/PassChain rely on. Concrete passes are
// three.js-based classes under ./composer and ./passes.
export interface EffectPassLike {
  enabled?: boolean;
  setSize?: (width: number, height: number) => void;
  dispose?: () => void;
  __updateScenePass?: (frameData?: RenderFrameData | null) => void;
}

export type EffectPassResult = EffectPassLike | EffectPassLike[] | null;

export type EffectPassFactory = (
  effect: EffectPassConfig,
  width: number,
  height: number,
) => EffectPassResult;

export interface EffectPassMeta {
  // When true, property changes update uniforms live and do not rebuild the
  // pass (except for the properties listed in structuralProps).
  liveUpdatable?: boolean;
  structuralProps?: string[];
}

interface EffectPassEntry {
  factory: EffectPassFactory;
  meta: EffectPassMeta;
}

const registry = new Map<string, EffectPassEntry>();

export function registerEffectPass(
  name: string,
  factory: EffectPassFactory,
  meta: EffectPassMeta = {},
) {
  registry.set(name, { factory, meta });
}

export function unregisterEffectPass(name: string) {
  registry.delete(name);
}

export function getEffectPassFactory(name: string): EffectPassFactory | null {
  return registry.get(name)?.factory ?? null;
}

export function getEffectPassMeta(name: string): EffectPassMeta | null {
  return registry.get(name)?.meta ?? null;
}

/**
 * Stores a per-frame updater on the pass (called by SceneWithEffects with the
 * current frame data), runs it once so the pass starts configured, and
 * returns the pass.
 */
export function attachPassUpdater<T extends EffectPassLike>(
  pass: T,
  update: (frameData?: RenderFrameData | null) => void,
): T {
  pass.__updateScenePass = update;
  update(null);
  return pass;
}

export function isEffectEnabled(effect: EffectPassConfig): boolean {
  return effect.enabled !== false;
}
