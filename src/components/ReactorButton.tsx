import { useTranslation } from 'react-i18next';
import { setActiveReactorId } from '@/app/actions/app';
import { projectDocument, useDocument } from '@/app/document';
import { Flash, Plus } from '@/app/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type Display from '@/lib/core/Display';
import { REACTOR_MODES, type ReactorMode } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * The output range a binding starts with in each mode: the control's range
 * to replace the value, up to the whole range on top of it to add, and 0..1
 * to scale it.
 */
function defaultRange(mode: ReactorMode, min: number, max: number) {
  if (mode === 'add') return { min: 0, max: max - min };
  if (mode === 'multiply') return { min: 0, max: 1 };
  return { min, max };
}

interface ReactorButtonProps {
  display: Display;
  name: string;
  min?: number;
  max?: number;
  className?: string;
}

export default function ReactorButton({
  display,
  name,
  min = 0,
  max = 1,
  className,
}: ReactorButtonProps) {
  const { t } = useTranslation();
  const reactor = display.getReactor(name);
  const reactorList = useDocument(state => state.reactors);
  const mode = reactor?.mode ?? 'replace';

  function assignReactor(reactorId: string) {
    projectDocument.apply({
      type: 'bindReactor',
      id: display.id,
      property: name,
      reactorId,
      mode,
      ...(reactor ? { min: reactor.min, max: reactor.max } : defaultRange(mode, min, max)),
    });
    setActiveReactorId(reactorId);
  }

  function setMode(next: ReactorMode) {
    if (!reactor || next === mode) return;
    projectDocument.apply({
      type: 'bindReactor',
      id: display.id,
      property: name,
      reactorId: reactor.id,
      mode: next,
      ...defaultRange(next, min, max),
    });
  }

  // One undo step: the new reactor and its binding.
  function createAndAssign() {
    const { id: reactorId } = projectDocument.apply({ type: 'addReactor' });
    if (reactorId) {
      assignReactor(reactorId);
    }
  }

  return (
    <div className={cn('relative', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant={reactor ? 'default' : 'ghost'}
              size="icon-xs"
              className={cn(
                'min-h-5 min-w-5 shrink-0 border-0 p-0',
                reactor
                  ? 'bg-primary text-neutral-100 hover:bg-primary/80'
                  : 'bg-transparent text-neutral-500 hover:bg-transparent hover:text-neutral-100',
              )}
            >
              <Flash className="h-3.5 w-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent side="left" align="start" sideOffset={4} className="min-w-40">
          <DropdownMenuRadioGroup value={reactor?.id ?? ''}>
            {reactorList.map(r => (
              <DropdownMenuRadioItem key={r.id} value={r.id} onClick={() => assignReactor(r.id)}>
                <Flash className="h-3.5 w-3.5 text-neutral-400" />
                {r.displayName}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {reactor && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t('reactor-panel.mode')}</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={mode}>
                  {REACTOR_MODES.map(item => (
                    <DropdownMenuRadioItem key={item} value={item} onClick={() => setMode(item)}>
                      {t(`reactor-panel.mode-${item}`)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </>
          )}
          {reactorList.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={createAndAssign}>
              <Plus className="h-3.5 w-3.5 text-neutral-400" />
              New Reactor
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
