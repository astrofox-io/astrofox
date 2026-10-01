export function updateExistingProps(obj: object, props: Record<string, unknown>) {
  let changed = false;
  const target = obj as Record<string, unknown>;

  for (let keys = Object.keys(props), len = keys.length, i = 0; i < len; ++i) {
    const key = keys[i];
    if (key in target) {
      const value = props[key];
      if (value !== target[key]) {
        target[key] = value;
        changed = true;
      }
    }
  }

  return changed;
}

export function resolve(value: unknown, args: unknown[] = []) {
  return typeof value === 'function' ? value(...args) : value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Whether two JSON-like values have the same content: arrays and plain objects
 * are compared member by member, anything else (numbers, strings, class
 * instances) with `Object.is`.
 */
export function isDeepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => isDeepEqual(item, b[index]));
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every(key => Object.hasOwn(b, key) && isDeepEqual(a[key], b[key]))
    );
  }

  return false;
}

/** Refuse prototype keys, non-finite numbers and deep nesting anywhere in outside input. */
export function assertSafe(value: unknown, depth = 0): void {
  if (depth > 25) throw new Error('Object nesting exceeds 25 levels.');
  if (typeof value === 'number' && !Number.isFinite(value))
    throw new Error('Numbers must be finite.');
  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key))
        throw new Error(`Forbidden property: ${key}`);
      assertSafe(entry, depth + 1);
    }
  }
}
