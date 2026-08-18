import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import useAppStore from '@/app/actions/app';
import useAudioStore from '@/app/actions/audio';
import { player } from '@/app/global';
import useSharedState from '@/app/hooks/useSharedState';
import RangeInput from '@/components/RangeInput';
import TimeInfo from '@/components/TimeInfo';

const PROGRESS_MAX = 1000;

const initialState = {
  progressPosition: 0,
  seekPosition: 0,
  buffering: false,
};

type ProgressState = typeof initialState;

export default function ProgressControl() {
  const { t } = useTranslation(undefined, { keyPrefix: 'player' });
  const isVideoRecording = useAppStore(state => state.isVideoRecording);
  const videoExportPosition = useAppStore(state => state.videoExportPosition);
  const { liveModeEnabled, mode, sourceLabel } = useAudioStore(
    useShallow(state => ({
      liveModeEnabled: state.liveModeEnabled,
      mode: state.mode,
      sourceLabel: state.sourceLabel,
    })),
  );
  const [state, setState] = useSharedState(initialState) as readonly [
    ProgressState,
    (nextState: Partial<ProgressState>) => void,
  ];
  const { progressPosition, seekPosition, buffering } = state;
  const duration = player.getDuration();
  const canSeek = player.canSeek();
  const disabled = !canSeek || isVideoRecording;
  const displayPosition =
    isVideoRecording && videoExportPosition != null ? videoExportPosition : progressPosition;

  function handleProgressChange(value: number) {
    player.seek(value);
    setState({ progressPosition: value, seekPosition: 0, buffering: false });
  }

  function handleProgressUpdate(value: number) {
    setState({ seekPosition: value, buffering: true });
  }

  function handlePlayerUpdate() {
    if (player.isPlaying() && !buffering) {
      setState({ progressPosition: player.getPosition() });
    }
  }

  function handlePlayerStop() {
    setState({ progressPosition: 0 });
  }

  useEffect(() => {
    player.on('tick', handlePlayerUpdate);
    player.on('stop', handlePlayerStop);

    return () => {
      player.off('tick', handlePlayerUpdate);
      player.off('stop', handlePlayerStop);
    };
  }, []);

  if (liveModeEnabled && !canSeek) {
    const liveText =
      mode === 'microphone'
        ? sourceLabel || t('live-microphone-input')
        : mode === 'desktop'
          ? sourceLabel || t('live-desktop-audio')
          : mode === 'midi'
            ? sourceLabel || t('live-midi-input')
            : t('choose-audio-or-live-input');

    return (
      <div className="flex flex-1 items-center">
        <div className="text-sm text-neutral-400">{liveText}</div>
      </div>
    );
  }

  return (
    <div className={'flex items-center flex-1'}>
      <RangeInput
        className={'w-full mr-5'}
        name="progress"
        min={0}
        max={PROGRESS_MAX}
        value={displayPosition * PROGRESS_MAX}
        buffered
        onChange={(_name, newValue) => handleProgressChange(newValue / PROGRESS_MAX)}
        onUpdate={(_name, newValue) => handleProgressUpdate(newValue / PROGRESS_MAX)}
        disabled={disabled}
        hideThumb={disabled}
      />
      <TimeInfo
        currentTime={
          duration * (isVideoRecording ? displayPosition : seekPosition || progressPosition)
        }
        totalTime={duration}
      />
    </div>
  );
}
