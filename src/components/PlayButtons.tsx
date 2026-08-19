import { clsx as classNames } from 'cnfast';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import useAppStore, { cancelVideoExport } from '@/app/actions/app';
import useAudioStore, { setLiveModeEnabled } from '@/app/actions/audio';
import { player } from '@/app/global';
import useForceUpdate from '@/app/hooks/useForceUpdate';
import { Pause, Play, Stop } from '@/app/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function PlayButtons() {
  const { t } = useTranslation(undefined, { keyPrefix: 'player' });
  const forceUpdate = useForceUpdate();
  const isVideoRecording = useAppStore(state => state.isVideoRecording);
  const { liveModeEnabled, mode } = useAudioStore(
    useShallow(state => ({
      liveModeEnabled: state.liveModeEnabled,
      mode: state.mode,
    })),
  );
  const playing = player.isPlaying();
  const hasSource = liveModeEnabled ? player.hasSource() : true;
  const PlayPauseIcon = isVideoRecording ? Play : playing ? Pause : Play;

  useEffect(() => {
    player.on('playback-change', forceUpdate);
    player.on('source-change', forceUpdate);

    return () => {
      player.off('playback-change', forceUpdate);
      player.off('source-change', forceUpdate);
    };
  }, [forceUpdate]);

  function handlePlayButtonClick() {
    if (isVideoRecording || !hasSource) {
      return;
    }

    player.play();
  }

  function handleStopButtonClick() {
    if (isVideoRecording) {
      cancelVideoExport();
      return;
    }

    if (!hasSource) {
      return;
    }

    if (liveModeEnabled && mode === 'desktop') {
      setLiveModeEnabled(false);
      return;
    }

    player.stop();
  }

  const playTitle = isVideoRecording
    ? t('recording')
    : !liveModeEnabled
      ? playing
        ? t('pause')
        : t('play')
      : hasSource
        ? playing
          ? mode === 'file'
            ? t('pause')
            : t('pause-live-input')
          : mode === 'file'
            ? t('play')
            : t('start-live-input')
        : mode === 'microphone'
          ? t('connect-microphone')
          : mode === 'desktop'
            ? t('capture-desktop-audio')
            : mode === 'midi'
              ? t('connect-midi')
              : t('load-audio');
  const stopTitle = hasSource
    ? !liveModeEnabled || mode === 'file'
      ? t('stop')
      : t('stop-live-input')
    : t('no-active-input');

  return (
    <div className={'whitespace-nowrap'}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className={classNames(
                  'text-neutral-100 bg-transparent p-0 mr-1 inline-flex items-center justify-center [flex-wrap:nowrap] border-2 h-10 w-10 rounded-full leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0',
                  {
                    'border-neutral-700 [&:hover]:border-2 [&:hover]:border-primary [&:active]:border-neutral-100':
                      !isVideoRecording && (!liveModeEnabled || hasSource),
                    'border-primary/60 cursor-not-allowed':
                      isVideoRecording || (liveModeEnabled && !hasSource),
                  },
                )}
                disabled={isVideoRecording || (liveModeEnabled && !hasSource)}
                onClick={handlePlayButtonClick}
              />
            }
          >
            <div className="relative inline-flex items-center justify-center">
              {isVideoRecording && (
                <span className="pointer-events-none absolute -inset-1 rounded-full border-2 border-transparent border-t-primary border-r-primary/50 animate-spin" />
              )}
              <PlayPauseIcon
                className={classNames('w-6 h-6', {
                  'translate-x-px': !playing,
                  'text-primary': isVideoRecording,
                })}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            sideOffset={6}
            className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
          >
            {playTitle}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className={classNames(
                  'text-neutral-100 bg-transparent p-0 mr-1 inline-flex items-center justify-center [flex-wrap:nowrap] border-2 border-neutral-700 h-10 w-10 rounded-full leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-2 [&:hover]:border-primary [&:active]:border-neutral-100',
                  {
                    'cursor-not-allowed opacity-60': liveModeEnabled && !hasSource,
                  },
                )}
                disabled={liveModeEnabled && !hasSource}
                onClick={handleStopButtonClick}
              />
            }
          >
            <Stop className={'w-6 h-6'} />
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            sideOffset={6}
            className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
          >
            {isVideoRecording ? t('stop-recording') : stopTitle}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
