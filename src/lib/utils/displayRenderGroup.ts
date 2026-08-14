export type DisplayRenderGroup = '2d' | '3d';

const renderGroups = new Map<string, DisplayRenderGroup>([
  ['CubesDisplay', '3d'],
  ['GeometryDisplay', '3d'],
  ['MeshGridDisplay', '3d'],
  ['TunnelDisplay', '3d'],
]);

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
