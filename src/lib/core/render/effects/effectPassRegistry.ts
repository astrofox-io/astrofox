/**
 * Registry of externally-registered effect pass factories. Core effects are
 * built by createScenePass/createRawEffect; entries here take precedence and
 * are how module-provided effects plug into the composer without touching
 * those switch statements.
 */

export interface EffectPassMeta {
  // When true, property changes update uniforms live and do not rebuild the
  // pass (except for the properties listed in structuralProps).
  liveUpdatable?: boolean;
  structuralProps?: string[];
}

export type EffectPassFactory = (
  effect: { id: string; name: string; properties: Record<string, unknown> },
  width: number,
  height: number,
) => unknown;

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
