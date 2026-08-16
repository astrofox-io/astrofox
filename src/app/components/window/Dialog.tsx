import { clsx as classNames } from 'cnfast';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface DialogProps {
  icon?: LucideIcon | string;
  message?: string;
  detail?: string;
  buttons?: string[];
  onConfirm?: (button: string) => void;
}

export default function Dialog({ icon, message, detail, buttons, onConfirm }: DialogProps) {
  return (
    <div className="flex min-h-[12rem] w-full max-w-[38rem] flex-col cursor-default">
      <div className="flex flex-1 items-start gap-4 px-6 py-6">
        {icon && (
          <div
            className={classNames('mt-1 text-3xl', typeof icon === 'string' ? icon : undefined)}
          />
        )}
        <div className="flex-1 text-sm leading-6 text-neutral-100">
          <div>{message}</div>
          {detail && (
            <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-neutral-900 p-2 text-xs leading-5 text-neutral-400">
              {detail}
            </pre>
          )}
        </div>
      </div>
      {buttons && (
        <div className="shrink-0 bg-neutral-800 px-4 py-3">
          <DialogFooter className="sm:justify-end">
            {buttons.map((button: string) => (
              <Button key={button} variant="default" size="sm" onClick={() => onConfirm?.(button)}>
                {button}
              </Button>
            ))}
          </DialogFooter>
        </div>
      )}
    </div>
  );
}
