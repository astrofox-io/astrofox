import { useTranslation } from 'react-i18next';
import useApp, { type AddMenuKind, closeAddMenu, openAddMenu } from '@/app/actions/app';
import { SquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAddMenuConfig } from './addMenuConfig';

interface SectionAddMenuProps {
  sceneId: string;
  kind: AddMenuKind;
}

/** Header "+" button that opens the slide-out add menu for a scene section. */
export default function SectionAddMenu({ sceneId, kind }: SectionAddMenuProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'add-menu' });
  const addMenu = useApp(state => state.addMenu);
  const open = addMenu?.sceneId === sceneId && addMenu?.kind === kind;
  const { title } = getAddMenuConfig(t, kind);

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={title}
      aria-expanded={open}
      data-add-menu-trigger=""
      className={cn(
        'size-6 rounded text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100',
        open && 'bg-neutral-800 text-neutral-100',
      )}
      onClick={event => {
        event.stopPropagation();
        if (open) {
          closeAddMenu();
        } else {
          openAddMenu(sceneId, kind);
        }
      }}
    >
      <SquarePlus className="size-5" />
    </Button>
  );
}
