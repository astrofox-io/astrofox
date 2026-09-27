import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import useAppStore from '@/app/actions/app';
import useAudioStore from '@/app/actions/audio';
import { seekTransport } from '@/app/actions/timeline';
import { player } from '@/app/global';
import RangeInput from '@/components/RangeInput';
import TimeInfo from '@/components/TimeInfo';
import transportStore from '@/lib/timeline/transport';

const PROGRESS_MAX = 1000;

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
  const time = transportStore(state => state.time);
  const duration = transportStore(state => state.duration);
  // Fraction shown while the thumb is being dragged, before the seek commits.
  const [seekPosition, setSeekPosition] = useState<number | null>(null);
  const canSeek = player.canSeek();
  const disabled = isVideoRecording;
  const progressPosition = duration > 0 ? time / duration : 0;
  const displayPosition =
    isVideoRecording && videoExportPosition != null ? videoExportPosition : progressPosition;

  function handleProgressChange(value: number) {
    seekTransport(value * duration);
    setSeekPosition(null);
  }

  function handleProgressUpdate(value: number) {
    setSeekPosition(value);
  }

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
          duration * (isVideoRecording ? displayPosition : (seekPosition ?? progressPosition))
        }
        totalTime={duration}
      />
    </div>
  );
}
