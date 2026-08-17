/**
 * Dependency-free registry of which display types own a 3D camera. Populated
 * by the display layer registry; consumed by app code (stage camera mode,
 * layer icons, transform gating) that must not import the render layer.
 */
const cameraDisplays = new Set<string>();

export function registerDisplayCamera(name: string, hasCamera: boolean) {
  if (hasCamera) {
    cameraDisplays.add(name);
  } else {
    cameraDisplays.delete(name);
  }
}

export function unregisterDisplayCamera(name: string) {
  cameraDisplays.delete(name);
}

export function hasDisplayCamera(display?: { name?: string | null } | string | null): boolean {
  const name = typeof display === 'string' ? display : display?.name;
  return cameraDisplays.has(name || '');
}
