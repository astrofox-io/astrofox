import type { TFunction } from 'i18next';
import type { AddMenuKind } from '@/app/actions/app';
import { library } from '@/app/global';

export interface MenuCategory {
  label: string;
  items: string[];
}

interface LibraryItem {
  config?: {
    label?: string;
    external?: boolean;
  };
}

export type EntityConstructor = (new (
  properties?: Record<string, unknown>,
) => {
  id?: string;
}) &
  LibraryItem;

export interface MenuItem {
  key: string;
  label: string;
  Entity: EntityConstructor;
}

export type EntityType = 'displays' | 'effects';

export interface AddMenuConfig {
  entityType: EntityType;
  title: string;
  categories: MenuCategory[];
}

/** Menu definition for each section. `t` must be scoped to the `add-menu` namespace. */
export function getAddMenuConfig(t: TFunction, kind: AddMenuKind): AddMenuConfig {
  switch (kind) {
    case 'effects':
      return {
        entityType: 'effects',
        title: t('add-effect'),
        categories: [
          { label: t('category-color'), items: ['Color'] },
          {
            label: t('category-blur-focus'),
            items: ['Blur', 'Bloom', 'Depth of Field', 'Tilt Shift'],
          },
          {
            label: t('category-distortion'),
            items: ['Distortion', 'Glitch', 'Kaleidoscope', 'Mirror', 'RGB Shift'],
          },
          {
            label: t('category-pattern'),
            items: ['ASCII', 'Color Halftone', 'Dot Screen', 'LED', 'Pixelate', 'Scanline'],
          },
          { label: t('category-stylize'), items: ['Noise', 'Perlin Noise', 'Vignette'] },
        ],
      };
    case '3d':
      return {
        entityType: 'displays',
        title: t('add-3d-display'),
        categories: [
          { label: t('category-3d'), items: ['Geometry', 'Tunnel', 'Cubes', 'Mesh Grid'] },
        ],
      };
    default:
      return {
        entityType: 'displays',
        title: t('add-2d-display'),
        categories: [
          {
            label: t('category-2d'),
            items: [
              'Text',
              'Image',
              'Video',
              'Shape',
              'Bar Spectrum',
              'Radial Spectrum',
              'Wave Spectrum',
              'Waveform Ring',
              'Sound Wave',
            ],
          },
        ],
      };
  }
}

export function getLibraryItems(entityType: EntityType) {
  return (library.get(entityType) ?? {}) as Record<string, EntityConstructor>;
}

export function getCategoryItems(
  itemsByKey: Record<string, EntityConstructor>,
  labels: string[],
): MenuItem[] {
  return labels
    .map(label => {
      const match = Object.entries(itemsByKey).find(([, Entity]) => Entity.config?.label === label);

      if (!match) {
        return null;
      }

      const [key, Entity] = match;
      return { key, label, Entity };
    })
    .filter(Boolean) as MenuItem[];
}

export function getExternalItems(itemsByKey: Record<string, EntityConstructor>): MenuItem[] {
  return Object.entries(itemsByKey)
    .filter(([, Entity]) => Entity.config?.external)
    .map(([key, Entity]) => ({
      key,
      label: Entity.config?.label ?? key,
      Entity,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
