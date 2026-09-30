import { setActiveReactorId } from '@/app/actions/app';
import { projectDocument, useDocument } from '@/app/document';
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
  const reactorList = useDocument(state => state.reactors);

  function assignReactor(reactorId: string) {
    projectDocument.apply({
      type: 'bindReactor',
      id: display.id,
      property: name,
      reactorId,
      min,
      max,
    });
    setActiveReactorId(reactorId);
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
