import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAudioStore, {
  connectDesktopAudio,
  connectMidiInput,
  refreshInputOptions,
  refreshMicrophoneDevices,
  selectMicrophoneDevice,
  selectMidiInput,
  setLiveInputMode,
} from '@/app/actions/audio';
import SelectInput from '@/app/components/inputs/SelectInput';

export default function LiveModePanel() {
  const { t } = useTranslation(undefined, { keyPrefix: 'live-mode' });
  const {
    loading,
    liveInputMode,
    microphoneDevices,
    selectedMicrophoneId,
    desktopAudioSupported,
    midiInputs,
    selectedMidiInputId,
  } = useAudioStore(state => state);
  const hasMidiInputs = midiInputs.length > 0;
  const liveInputItems = [
    { id: 'microphone', label: t('microphone') },
    ...(desktopAudioSupported ? [{ id: 'desktop', label: t('desktop-audio') }] : []),
    { id: 'midi', label: t('midi') },
  ] as Array<Record<string, string>>;
  const microphoneItems =
    microphoneDevices.length > 0
      ? microphoneDevices.map(device => ({
          id: device.id,
          label: device.label,
        }))
      : [{ id: '', label: t('no-microphones-found') }];
  const midiItems =
    midiInputs.length > 0
      ? midiInputs.map(input => ({
          id: input.id,
          label: input.label,
        }))
      : [{ id: '', label: t('no-midi-inputs-found') }];

  useEffect(() => {
    void refreshInputOptions();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return undefined;
    }

    const handleDeviceChange = () => {
      void refreshMicrophoneDevices();
    };

    navigator.mediaDevices.addEventListener?.('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener?.('devicechange', handleDeviceChange);
    };
  }, []);

  return (
    <div className="flex w-full items-center gap-3">
      <SelectInput
        name="live-input-mode"
        value={liveInputMode}
        items={liveInputItems}
        valueField="id"
        displayField="label"
        width={140}
        onChange={(_name, value) =>
          setLiveInputMode((String(value) as 'microphone' | 'midi' | 'desktop') || 'microphone')
        }
      />

      {liveInputMode === 'microphone' && (
        <SelectInput
          name="microphone-device"
          value={selectedMicrophoneId || microphoneDevices[0]?.id || ''}
          items={microphoneItems}
          valueField="id"
          displayField="label"
          width={260}
          onChange={(_name, value) => void selectMicrophoneDevice(String(value || ''))}
        />
      )}

      {liveInputMode === 'desktop' && (
        <button
          type="button"
          className="inline-flex h-8 items-center rounded border border-input bg-input/30 px-2.5 text-sm text-neutral-300 shadow-xs transition-colors hover:bg-input/50 hover:text-neutral-100 disabled:pointer-events-none disabled:opacity-50"
          disabled={loading || !desktopAudioSupported}
          onClick={() => void connectDesktopAudio()}
        >
          {t('capture-desktop-audio')}
        </button>
      )}

      {liveInputMode === 'midi' && (
        <>
          <SelectInput
            name="midi-input"
            value={selectedMidiInputId || midiInputs[0]?.id || ''}
            items={midiItems}
            valueField="id"
            displayField="label"
            width={260}
            onChange={(_name, value) => void selectMidiInput(String(value || ''))}
          />
          <button
            type="button"
            className="inline-flex h-8 items-center rounded border border-input bg-input/30 px-2.5 text-sm text-neutral-300 shadow-xs transition-colors hover:bg-input/50 hover:text-neutral-100 disabled:pointer-events-none disabled:opacity-50"
            disabled={loading || !hasMidiInputs}
            onClick={() => void connectMidiInput()}
          >
            {t('connect')}
          </button>
        </>
      )}
    </div>
  );
}
