export type DisplayRenderGroup = '2d' | '3d';

// Populated by registerDisplayLayer (core displays at module load, plugins at
// install); kept in this dependency-free module so UI code can ask about
// render groups without importing the three.js layer registry.
const renderGroups = new Map<string, DisplayRenderGroup>();

export function registerDisplayRenderGroup(name: string, group: DisplayRenderGroup) {
  renderGroups.set(name, group);
}

export function unregisterDisplayRenderGroup(name: string) {
  renderGroups.delete(name);
}

export function getDisplayRenderGroup(
  display?: { name?: string | null } | string | null,
): DisplayRenderGroup {
  const name = typeof display === 'string' ? display : display?.name;
  return renderGroups.get(name || '') ?? '2d';
}

export function is3DDisplay(display?: { name?: string | null } | string | null): boolean {
  return getDisplayRenderGroup(display) === '3d';
}
