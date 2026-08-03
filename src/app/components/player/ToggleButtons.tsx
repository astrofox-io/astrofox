import { clsx as classNames } from 'cnfast';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAppStore from '@/app/actions/app';
import useAudioStore from '@/app/actions/audio';
import { player } from '@/app/global';
import useForceUpdate from '@/app/hooks/useForceUpdate';
import { Cycle } from '@/app/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ToggleButtons() {
  const { t } = useTranslation(undefined, { keyPrefix: 'player' });
  const isVideoRecording = useAppStore(state => state.isVideoRecording);
  const liveModeEnabled = useAudioStore(state => state.liveModeEnabled);
  const forceUpdate = useForceUpdate();
  const looping = player.isLooping();

  if (isVideoRecording || liveModeEnabled) {
    return null;
  }

  function handleLoopButtonClick() {
    player.setLoop(!looping);
    forceUpdate();
  }

  return (
    <div className={'flex [&.is-focused_.button]:opacity-[1]'}>
      <ToggleButton
        icon={Cycle}
        title={t('repeat')}
        enabled={looping}
        onClick={handleLoopButtonClick}
      />
    </div>
  );
}

interface ToggleButtonProps {
  enabled?: boolean;
  title?: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

const ToggleButton = ({ enabled, title, icon, onClick }: ToggleButtonProps) => {
  const IconComponent = icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className={'mr-2.5 [&:last-child]:mr-0 cursor-default'}
              onClick={onClick}
            />
          }
        >
          {IconComponent && (
            <IconComponent
              className={classNames('w-4 h-4', {
                '!text-neutral-500 hover:!text-neutral-400': !enabled,
                '!text-neutral-200 hover:!text-neutral-100': enabled,
              })}
            />
          )}
        </TooltipTrigger>
        {title && (
          <TooltipContent
            side="top"
            sideOffset={6}
            className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
          >
            {title}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
