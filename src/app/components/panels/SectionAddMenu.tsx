import { useTranslation } from 'react-i18next';
import { setActiveElementId } from '@/app/actions/app';
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

export default function SectionAddMenu({
  sceneId,
  entityType,
  categories,
  ariaLabel,
}: SectionAddMenuProps) {
  const { t } = useTranslation();
  const libraryItems = getLibraryItems(entityType);

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
