import { clsx as classNames } from 'cnfast';
import { useTranslation } from 'react-i18next';
import useApp, { setControlsPanelMode } from '@/app/actions/app';
import { LayerFocus, Layers } from '@/app/icons';
import ControlsPanel from '@/components/ControlsPanel';
import PanelHeader from '@/components/PanelHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ControlsPanelMode = 'active' | 'all';

interface ModeButtonProps {
  mode: ControlsPanelMode;
  currentMode: ControlsPanelMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function ModeButton({ mode, currentMode, label, icon: Icon }: ModeButtonProps) {
  const active = mode === currentMode;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            className={classNames(
              'size-7 inline-flex justify-center items-center rounded-sm cursor-default shrink-0 transition-colors',
              {
                'bg-neutral-700 text-neutral-100 shadow-sm': active,
                'text-neutral-400 hover:text-neutral-100': !active,
              },
            )}
            onClick={() => setControlsPanelMode(mode)}
          />
        }
      >
        <Icon className="w-4 h-4" />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={6}
        className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default function RightPanel() {
  const { t } = useTranslation(undefined, { keyPrefix: 'panels' });
  const controlsPanelMode = useApp(state => state.controlsPanelMode);

  return (
    <div className="flex flex-col w-90 shrink-0 overflow-hidden border-l">
      <PanelHeader
        title={t('controls')}
        actions={
          <TooltipProvider>
            <div className="mr-1.5 flex items-center gap-0.5 rounded-md border border-neutral-700 bg-neutral-900 p-0.5">
              <ModeButton
                mode="active"
                currentMode={controlsPanelMode}
                label={t('show-active-layer')}
                icon={LayerFocus}
              />
              <ModeButton
                mode="all"
                currentMode={controlsPanelMode}
                label={t('show-all-layers')}
                icon={Layers}
              />
            </div>
          </TooltipProvider>
        }
      />
      <ControlsPanel />
    </div>
  );
}
