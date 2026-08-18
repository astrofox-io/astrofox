import { setActiveReactorId } from '@/app/actions/app';
import useReactors, { addReactor } from '@/app/actions/reactors';
import { loadScenes } from '@/app/actions/scenes';
import { Flash, Plus } from '@/app/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type Display from '@/lib/core/Display';
import { cn } from '@/lib/utils';

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
  const reactor = display.getReactor(name);
  const reactorList = useReactors(state => state.reactors) as {
    id: string;
    name: string;
    displayName: string;
  }[];

  function assignReactor(reactorId: string) {
    display.setReactor(name, { id: reactorId, min, max });
    setActiveReactorId(reactorId);
    loadScenes();
  }

  function createAndAssign() {
    const newReactor = addReactor() as { id: string } | undefined;
    if (newReactor) {
      assignReactor(newReactor.id);
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
