import { useTranslation } from 'react-i18next';
import useApp, { setActiveElementId } from '@/app/actions/app';
import { showModal } from '@/app/actions/modals';
import { addElement } from '@/app/actions/scenes';
import { library } from '@/app/global';
import { Plus } from '@/app/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { translateLabel } from '@/i18n/labels';

interface MenuCategory {
  label: string;
  items: string[];
}

interface SectionAddMenuProps {
  sceneId: string;
  entityType: 'displays' | 'effects';
  categories: MenuCategory[];
  ariaLabel: string;
}

interface LibraryItem {
  config?: {
    label?: string;
    external?: boolean;
  };
}

type EntityConstructor = (new (
  properties?: Record<string, unknown>,
) => {
  id?: string;
}) &
  LibraryItem;

interface MenuItem {
  key: string;
  label: string;
  Entity: EntityConstructor;
}

function getLibraryItems(entityType: 'displays' | 'effects') {
  return (library.get(entityType) ?? {}) as Record<string, EntityConstructor>;
}

function getCategoryItems(
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
      return {
        key,
        label,
        Entity,
      };
    })
    .filter(Boolean) as MenuItem[];
}

function getExternalItems(itemsByKey: Record<string, EntityConstructor>): MenuItem[] {
  return Object.entries(itemsByKey)
    .filter(([, Entity]) => Entity.config?.external)
    .map(([key, Entity]) => ({
      key,
      label: Entity.config?.label ?? key,
      Entity,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default function SectionAddMenu({
  sceneId,
  entityType,
  categories,
  ariaLabel,
}: SectionAddMenuProps) {
  const { t } = useTranslation();
  // Re-read the library after a module install/uninstall.
  useApp(state => state.modulesUpdatedAt);
  const libraryItems = getLibraryItems(entityType);
  const externalItems = getExternalItems(libraryItems);

  function handleSelect(Entity: EntityConstructor) {
    const entity = new Entity();
    addElement(entity, sceneId);
    setActiveElementId(entity.id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-100"
            aria-label={ariaLabel}
          />
        }
      >
        <Plus className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-44 rounded border-neutral-700 bg-neutral-900 p-1"
        align="center"
        sideOffset={8}
      >
        {externalItems.length > 0 ? (
          <div>
            <DropdownMenuGroup>
              <DropdownMenuLabel>External</DropdownMenuLabel>
              {externalItems.map(item => (
                <DropdownMenuItem
                  key={item.key}
                  className="min-w-44 rounded text-sm focus:bg-primary focus:text-neutral-100"
                  onClick={() => handleSelect(item.Entity)}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </div>
        ) : null}
        {categories.map((category, index) => {
          const categoryItems = getCategoryItems(libraryItems, category.items);

          if (categoryItems.length === 0) {
            return null;
          }

          return (
            <div key={category.label}>
              {index > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuGroup>
                <DropdownMenuLabel>{category.label}</DropdownMenuLabel>
                {categoryItems.map(item => (
                  <DropdownMenuItem
                    key={item.key}
                    className="min-w-44 rounded text-sm focus:bg-primary focus:text-neutral-100"
                    onClick={() => handleSelect(item.Entity)}
                  >
                    {translateLabel(t, item.label)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </div>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-w-44 rounded text-sm text-neutral-400 focus:bg-primary focus:text-neutral-100"
          onClick={() => showModal('InstallModule', { title: 'Add External Module' })}
        >
          Add module from URL…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
