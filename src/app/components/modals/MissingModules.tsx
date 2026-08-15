import { showModal } from '@/app/actions/modals';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

export interface MissingModuleRef {
  name: string;
  url?: string;
}

interface MissingModulesProps {
  missing?: MissingModuleRef[];
  onClose?: () => void;
}

export default function MissingModules({ missing = [], onClose }: MissingModulesProps) {
  function handleInstall(url: string) {
    onClose?.();
    showModal('ManageModules', { titleKey: 'menu.manage-modules' }, { initialUrl: url });
  }

  return (
    <div className="flex w-[34rem] max-w-full flex-col">
      <div className="flex flex-col gap-3 p-4">
        <div className="text-sm text-neutral-300">
          This project uses external modules that are not installed. Their layers and effects were
          skipped. Install the modules and reopen the project to restore them.
        </div>
        <div className="flex flex-col gap-2">
          {missing.map(item => (
            <div
              key={item.name}
              className="flex items-center gap-3 rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm text-neutral-100">{item.name}</div>
                {item.url ? (
                  <div className="truncate text-xs text-neutral-400">{item.url}</div>
                ) : (
                  <div className="text-xs text-neutral-500">No source URL recorded</div>
                )}
              </div>
              {item.url ? (
                <Button variant="secondary" size="sm" onClick={() => handleInstall(item.url ?? '')}>
                  Install…
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div className="shrink-0 bg-neutral-800 px-4 py-3">
        <DialogFooter className="sm:justify-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}
