import { clsx as classNames } from 'cnfast';
import { Mic, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAudioStore, { setLiveModeEnabled } from '@/app/actions/audio';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LiveModeToggleProps {
  mode?: 'enable' | 'close';
  className?: string;
}

export default function LiveModeToggle({ mode, className }: LiveModeToggleProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'player' });
  const liveModeEnabled = useAudioStore(state => state.liveModeEnabled);
  const action = mode || (liveModeEnabled ? 'close' : 'enable');
  const enabling = action === 'enable';
  const label = enabling ? t('enable-input-mode') : t('close-input-mode');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant={enabling ? 'outline' : 'ghost'}
              size="icon-sm"
              aria-label={label}
              aria-pressed={enabling ? liveModeEnabled : undefined}
              className={classNames(
                enabling
                  ? 'border-neutral-700 bg-transparent text-neutral-300 hover:border-primary hover:bg-neutral-800 hover:text-neutral-100'
                  : 'bg-transparent text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100',
                className,
              )}
              onClick={() => setLiveModeEnabled(enabling)}
            />
          }
        >
          {enabling ? <Mic size={16} /> : <X size={16} />}
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
