import { ContextMenu } from '@base-ui/react/context-menu';
import type { ReactElement } from 'react';
import { setActiveElementId } from '@/app/actions/app';
import { EditMenuItems } from '@/components/EditMenu';

export default function LayerContextMenu({ id, row }: { id: string; row: ReactElement }) {
  return (
    <ContextMenu.Root
      onOpenChange={open => {
        if (open) setActiveElementId(id);
      }}
    >
      <ContextMenu.Trigger render={row} />
      <ContextMenu.Portal>
        <ContextMenu.Positioner className="isolate z-50 outline-none">
          <ContextMenu.Popup className="w-max min-w-40 max-h-(--available-height) overflow-y-auto rounded bg-popover p-1 text-popover-foreground shadow-[0_14px_36px_rgba(0,0,0,0.42)] ring-1 ring-foreground/10 outline-none">
            <EditMenuItems layerOnly />
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
