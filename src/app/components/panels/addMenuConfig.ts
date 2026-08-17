import type { TFunction } from 'i18next';
import type { AddMenuKind } from '@/app/actions/app';
import { library } from '@/app/global';
import { hasDisplayCamera } from '@/lib/utils/displayCamera';

export interface MenuCategory {
  key: string;
  label: string;
}

interface LibraryItem {
  config?: {
    name?: string;
    label?: string;
    external?: boolean;
    // Effects: menu category key (see EFFECT_CATEGORIES). Effects without a
    // category are library-only (e.g. the ColorEffect sub-passes).
    category?: string;
    // Sort position within a category; unordered items follow, by label.
    order?: number;
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

const EFFECT_CATEGORIES = ['color', 'blur-focus', 'distortion', 'pattern', 'stylize'];

/** Menu definition for each section. `t` must be scoped to the `add-menu` namespace. */
export function getAddMenuConfig(t: TFunction, kind: AddMenuKind): AddMenuConfig {
  switch (kind) {
    case 'effects':
      return {
        entityType: 'effects',
        title: t('add-effect'),
        categories: EFFECT_CATEGORIES.map(key => ({ key, label: t(`category-${key}`) })),
      };
    default:
      return {
        entityType: 'displays',
        title: t('add-display'),
        categories: [
          { key: '2d', label: t('category-2d') },
          { key: '3d', label: t('category-3d') },
        ],
      };
  }
}

export function getLibraryItems(entityType: EntityType) {
  return (library.get(entityType) ?? {}) as Record<string, EntityConstructor>;
}

/** Displays are grouped by whether they own a 3D camera; effects by config.category. */
export function getItemCategory(entityType: EntityType, key: string, Entity: EntityConstructor) {
  if (entityType === 'displays') {
    return hasDisplayCamera(Entity.config?.name ?? key) ? '3d' : '2d';
  }
  return Entity.config?.category ?? null;
}

function compareItems(a: MenuItem, b: MenuItem) {
  const orderA = a.Entity.config?.order ?? Number.POSITIVE_INFINITY;
  const orderB = b.Entity.config?.order ?? Number.POSITIVE_INFINITY;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  return a.label.localeCompare(b.label);
}

/** Built-in entities belonging to a menu category, in menu order. */
export function getCategoryItems(
  entityType: EntityType,
  itemsByKey: Record<string, EntityConstructor>,
  category: string,
): MenuItem[] {
  return Object.entries(itemsByKey)
    .filter(
      ([key, Entity]) =>
        !Entity.config?.external && getItemCategory(entityType, key, Entity) === category,
    )
    .map(([key, Entity]) => ({ key, label: Entity.config?.label ?? key, Entity }))
    .sort(compareItems);
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
