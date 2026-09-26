import {
  Blocks,
  ClipboardCopy,
  ClipboardPaste,
  Copy,
  type LucideIcon,
  Redo2,
  Settings2,
  Undo2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import appStore, { handleMenuAction } from '@/app/actions/app';
import useHistory, {
  beginHistoryGesture,
  canPasteProperties,
  endHistoryGesture,
  selectedLayer,
} from '@/app/actions/history';
import modalStore from '@/app/actions/modals';
import useScenes from '@/app/actions/scenes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import menuConfig from '@/lib/config/menu.json';

const actionIcons: Record<string, LucideIcon> = {
  undo: Undo2,
  redo: Redo2,
  'duplicate-layer': Copy,
  'copy-properties': ClipboardCopy,
  'paste-properties': ClipboardPaste,
  'edit-canvas': Settings2,
  'manage-plugins': Blocks,
};

const shortcuts: Record<string, string> = {
  undo: 'Z',
  redo: 'Shift+Z',
  'duplicate-layer': 'D',
  'copy-properties': 'Shift+C',
  'paste-properties': 'Shift+V',
};

export default function EditMenu() {
  const { t } = useTranslation(undefined, { keyPrefix: 'menu' });
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        !(event.ctrlKey || event.metaKey)
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))
      )
        return;
      if (modalStore.getState().modals.some(modal => modal.open)) return;
      const key = event.key.toLowerCase();
      const action =
        key === 'z'
          ? event.shiftKey
            ? 'redo'
            : 'undo'
          : key === 'y' && !event.shiftKey
            ? 'redo'
            : key === 'd' && !event.shiftKey
              ? 'duplicate-layer'
              : key === 'c' && event.shiftKey
                ? 'copy-properties'
                : key === 'v' && event.shiftKey
                  ? 'paste-properties'
                  : null;
      if (!action) return;
      event.preventDefault();
      if (!event.repeat) void handleMenuAction(action);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', beginHistoryGesture, true);
    window.addEventListener('pointerup', endHistoryGesture);
    window.addEventListener('pointercancel', endHistoryGesture);
    window.addEventListener('blur', endHistoryGesture);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', beginHistoryGesture, true);
      window.removeEventListener('pointerup', endHistoryGesture);
      window.removeEventListener('pointercancel', endHistoryGesture);
      window.removeEventListener('blur', endHistoryGesture);
    };
  }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="text-neutral-400" />}
      >
        {t('edit')}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-64">
        <EditMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Shared by the title-bar Edit menu and layer context menus.
export function EditMenuItems({ layerOnly = false }: { layerOnly?: boolean }) {
  const { t } = useTranslation(undefined, { keyPrefix: 'menu' });
  const { canUndo, canRedo } = useHistory();
  appStore(state => state.activeElementId);
  useScenes(state => state.scenes);
  const [modifier, setModifier] = useState('Ctrl');
  useEffect(() => {
    setModifier(/Mac|iPhone|iPad/.test(navigator.platform) ? '\u2318' : 'Ctrl');
  }, []);
  const disabled: Record<string, boolean> = {
    undo: !canUndo,
    redo: !canRedo,
    'duplicate-layer': !selectedLayer(),
    'copy-properties': !selectedLayer(),
    'paste-properties': !canPasteProperties(),
  };
  const allEntries: { type?: string; action?: string; label?: string }[] = menuConfig.find(
    section => section.label === 'Edit',
  )!.submenu;
  const entries = layerOnly
    ? allEntries.filter(item => item.action && item.action in shortcuts)
    : allEntries;
  return (
    <>
      {entries.map((item, index) => {
        const Icon = item.action ? actionIcons[item.action] : undefined;
        return item.type === 'separator' ? (
          <DropdownMenuSeparator key={`separator-before-${entries[index + 1]?.action || 'end'}`} />
        ) : item.action ? (
          <DropdownMenuItem
            key={item.action}
            disabled={disabled[item.action]}
            onClick={() => handleMenuAction(item.action!)}
          >
            {Icon && <Icon aria-hidden="true" className="size-4" />}
            {t(item.action === 'edit-canvas' ? 'project-settings' : item.action, {
              defaultValue: item.label,
            })}
            {!layerOnly && shortcuts[item.action] ? (
              <DropdownMenuShortcut>
                {modifier}+{shortcuts[item.action]}
              </DropdownMenuShortcut>
            ) : null}
          </DropdownMenuItem>
        ) : null;
      })}
    </>
  );
}
