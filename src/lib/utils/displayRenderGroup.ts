const THREE_D_DISPLAY_NAMES = new Set([
  'CubesDisplay',
  'GeometryDisplay',
  'MeshGridDisplay',
  'TunnelDisplay',
]);

export type DisplayRenderGroup = '2d' | '3d';

export function getDisplayRenderGroup(
  display?: { name?: string | null } | string | null,
): DisplayRenderGroup {
  const name = typeof display === 'string' ? display : display?.name;
  return THREE_D_DISPLAY_NAMES.has(name || '') ? '3d' : '2d';
}

export function is3DDisplay(display?: { name?: string | null } | string | null): boolean {
  return getDisplayRenderGroup(display) === '3d';
}
