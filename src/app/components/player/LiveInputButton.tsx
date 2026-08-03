import { clsx as classNames } from 'cnfast';
import { Mic, Monitor } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import useAudioStore, {
  connectDesktopAudio,
  connectMicrophone,
  setLiveModeEnabled,
} from '@/app/actions/audio';
import { player } from '@/app/global';
import useForceUpdate from '@/app/hooks/useForceUpdate';

export default function LiveInputButton() {
  const { t } = useTranslation(undefined, { keyPrefix: 'player' });
  const forceUpdate = useForceUpdate();
  const { liveInputMode, loading, microphoneDevices, desktopAudioSupported } = useAudioStore(
    useShallow(state => ({
      liveInputMode: state.liveInputMode,
      loading: state.loading,
      microphoneDevices: state.microphoneDevices,
      desktopAudioSupported: state.desktopAudioSupported,
    })),
  );
  const isStreamMode = liveInputMode === 'microphone' || liveInputMode === 'desktop';
  const hasSource =
    (player.getMode() === 'microphone' || player.getMode() === 'desktop') && player.hasSource();
  const active = isStreamMode && player.isPlaying();
  const InputIcon = liveInputMode === 'desktop' ? Monitor : Mic;
  const disabled =
    !isStreamMode ||
    loading ||
    (liveInputMode === 'microphone' && microphoneDevices.length === 0) ||
    (liveInputMode === 'desktop' && !desktopAudioSupported);

  useEffect(() => {
    player.on('playback-change', forceUpdate);
    player.on('source-change', forceUpdate);

    return () => {
      player.off('playback-change', forceUpdate);
      player.off('source-change', forceUpdate);
    };
  }, [forceUpdate]);

  if (!isStreamMode) {
    return null;
  }

  function handleClick() {
    if (disabled) {
      return;
    }

    if (!hasSource) {
      if (liveInputMode === 'desktop') {
        void connectDesktopAudio();
        return;
      }

      void connectMicrophone();
      return;
    }

    if (active) {
      if (liveInputMode === 'desktop') {
        setLiveModeEnabled(false);
        return;
      }

      player.stop();
      return;
    }

    player.play();
  }

  return (
    <button
      type="button"
      className={classNames(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 bg-transparent p-0 text-neutral-100 leading-9 transition-[all_0.2s]',
        {
          'border-primary !bg-primary text-white shadow-[0_0_18px_rgba(119,95,216,0.35)]': active,
          'border-neutral-700 hover:border-primary active:border-neutral-100': !active && !disabled,
          'cursor-not-allowed border-neutral-800 text-neutral-600': disabled,
        },
      )}
      aria-label={
        active
          ? t('stop-input', { mode: liveInputMode })
          : t('start-input', { mode: liveInputMode })
      }
      aria-pressed={active}
      disabled={disabled}
      onClick={handleClick}
    >
      <InputIcon className="h-5 w-5" />
    </button>
  );
}
