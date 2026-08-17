import { Blocks } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useApp, { closeAddMenu, setActiveElementId } from '@/app/actions/app';
import { addElement } from '@/app/actions/scenes';
import { Times } from '@/app/icons';
import { Button } from '@/components/ui/button';
import { translateLabel } from '@/i18n/labels';
import { cn } from '@/lib/utils';
import { getDisplayRenderGroup } from '@/lib/utils/displayRenderGroup';
import {
  type EntityConstructor,
  getAddMenuConfig,
  getCategoryItems,
  getExternalItems,
  getLibraryItems,
  type MenuItem,
} from './addMenuConfig';

const DRAWER_WIDTH = '18rem';

interface AddElementDrawerProps {
  /** Left edge of the drawer (width of the left column it slides out from). */
  offset: string;
}

interface DrawerItem extends MenuItem {
  external: boolean;
}

interface DrawerGroup {
  key: string;
  label: string | null;
  items: DrawerItem[];
}

/**
 * Slide-out menu for adding effects/displays to a scene. Slides out from
 * beneath the left column and overlays the workspace (between title bar and
 * status bar) without pushing any content.
 */
export default function AddElementDrawer({ offset }: AddElementDrawerProps) {
  const { t } = useTranslation();
  const { t: ta } = useTranslation(undefined, { keyPrefix: 'add-menu' });
  const { t: tc } = useTranslation(undefined, { keyPrefix: 'common' });
  const addMenu = useApp(state => state.addMenu);
  // Re-read the library after a plugin install/uninstall.
  const pluginsUpdatedAt = useApp(state => state.pluginsUpdatedAt);
  const open = Boolean(addMenu);
  const asideRef = useRef<HTMLElement | null>(null);

  const { title, groups } = useMemo(() => {
    if (!addMenu) {
      return { title: '', groups: [] as DrawerGroup[] };
    }

    const config = getAddMenuConfig(ta, addMenu.kind);
    const libraryItems = getLibraryItems(config.entityType);
    const nextGroups: DrawerGroup[] = config.categories
      .map(category => ({
        key: category.label,
        label: category.label,
        items: getCategoryItems(libraryItems, category.items).map(item => ({
          ...item,
          external: false,
        })),
      }))
      .filter(group => group.items.length > 0);

    // Plugin entities are listed inline (marked with an icon) rather than in
    // their own "External" section. Displays only appear in the menu for the
    // render group they belong to.
    const externalItems = getExternalItems(libraryItems)
      .filter(item => {
        if (config.entityType !== 'displays') {
          return true;
        }
        return getDisplayRenderGroup(item.Entity.config?.name ?? item.key) === addMenu.kind;
      })
      .map(item => ({ ...item, external: true }));

    if (externalItems.length > 0) {
      if (nextGroups.length === 1) {
        nextGroups[0].items.push(...externalItems);
      } else {
        nextGroups.push({ key: 'external', label: null, items: externalItems });
      }
    }

    return { title: config.title, groups: nextGroups };
    // pluginsUpdatedAt forces a re-read of the library after plugin changes.
  }, [addMenu, ta, pluginsUpdatedAt]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeAddMenu();
      }
    }

    // The left column sits above the drawer, so clicks there bypass the
    // backdrop; close on any pointer down outside the drawer or its triggers.
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Element | null;
      if (!target) {
        return;
      }
      if (asideRef.current?.contains(target) || target.closest('[data-add-menu-trigger]')) {
        return;
      }
      closeAddMenu();
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [open]);

  function handleSelect(Entity: EntityConstructor) {
    if (!addMenu) {
      return;
    }

    const entity = new Entity();
    addElement(entity, addMenu.sceneId);
    setActiveElementId(entity.id);
    closeAddMenu();
  }

  return (
    <>
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 z-10 transition-opacity duration-300',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={closeAddMenu}
      />
      <aside
        ref={asideRef}
        aria-label={title}
        aria-hidden={!open}
        className={cn(
          'absolute top-0 bottom-0 z-20 flex flex-col overflow-hidden border-r bg-neutral-900',
          'transition-[translate,left,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          // Shadow only while open; hidden it sits flush under the left column and would bleed out.
          open
            ? 'translate-x-0 shadow-[8px_0_24px_rgba(0,0,0,0.45)]'
            : '-translate-x-full pointer-events-none shadow-none',
        )}
        style={{ width: DRAWER_WIDTH, left: offset }}
      >
        <div className="flex h-12 shrink-0 items-center border-b px-2.5">
          <div className="cursor-default text-xs font-medium uppercase tracking-wide text-neutral-400 leading-none">
            {title}
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={tc('close')}
            className="ml-auto text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
            onClick={closeAddMenu}
          >
            <Times className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {groups.map((group, index) => (
            <div key={group.key} className={cn(index > 0 && 'mt-2 border-t pt-2')}>
              {group.label ? (
                <div className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase text-neutral-400">
                  {group.label}
                </div>
              ) : null}
              <ul className="flex flex-col gap-0.5">
                {group.items.map(item => (
                  <li key={item.key}>
                    <Button
                      variant="ghost"
                      className="group h-8 w-full justify-start rounded px-2 text-sm font-normal text-neutral-200 transition-none hover:bg-primary hover:text-neutral-100"
                      onClick={() => handleSelect(item.Entity)}
                    >
                      <span className="min-w-0 flex-1 truncate text-left">
                        {item.external ? item.label : translateLabel(t, item.label)}
                      </span>
                      {item.external ? (
                        <Blocks
                          aria-label={tc('plugin')}
                          className="size-4 shrink-0 text-neutral-500 group-hover:text-neutral-100"
                        />
                      ) : null}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
