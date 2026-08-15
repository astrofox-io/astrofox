import { property, stageHeight, stageWidth } from '@/lib/utils/controls';
import { ALLOWED_CONTROL_TYPES } from './manifestSchema';

/**
 * Manifests are JSON, but core control schemas may hold functions (live
 * min/max bounds, hidden predicates). Plugins express those with declarative
 * refs which are resolved here into the same functions the control renderer
 * already understands:
 *
 *   { "$prop": "maxFrequency" }              -> property('maxFrequency')
 *   { "$prop": "autoSize", "not": true }     -> inverted predicate
 *   { "$prop": "size", "scale": 0.5 }        -> value * 0.5
 *   { "$stage": "width", "scale": -1 }       -> stageWidth(n => n * -1)
 */
function resolveValue(value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const ref = value as { $prop?: string; $stage?: string; not?: boolean; scale?: number };

    if (typeof ref.$prop === 'string') {
      if (ref.not) {
        return property(ref.$prop, (v: unknown) => !v);
      }
      if (typeof ref.scale === 'number') {
        const scale = ref.scale;
        return property(ref.$prop, (v: unknown) => Number(v) * scale);
      }
      return property(ref.$prop);
    }

    if (ref.$stage === 'width' || ref.$stage === 'height') {
      const fn = ref.$stage === 'height' ? stageHeight : stageWidth;
      if (typeof ref.scale === 'number') {
        const scale = ref.scale;
        return fn(n => n * scale);
      }
      return fn();
    }
  }

  return value;
}

export function resolveManifestControls(
  controls: Record<string, Record<string, unknown>> = {},
): Record<string, Record<string, unknown>> {
  const resolved: Record<string, Record<string, unknown>> = {};

  for (const [key, control] of Object.entries(controls)) {
    if (!ALLOWED_CONTROL_TYPES.has(String(control.type))) {
      continue;
    }

    const entry: Record<string, unknown> = {};
    for (const [prop, value] of Object.entries(control)) {
      entry[prop] = resolveValue(value);
    }
    resolved[key] = entry;
  }

  return resolved;
}
