import { useShallow } from 'zustand/react/shallow';
import useAudioStore, { setLiveInputGain } from '@/app/actions/audio';
import { RangeInput } from '@/app/components/inputs';

export default function LiveInputGain() {
  const { liveInputMode, liveInputGain } = useAudioStore(
    useShallow(state => ({
      liveInputMode: state.liveInputMode,
      liveInputGain: state.liveInputGain,
    })),
  );

  if (liveInputMode !== 'microphone' && liveInputMode !== 'desktop') {
    return null;
  }

  return (
    <div className="flex w-40 items-center">
      <RangeInput
        name="input-gain"
        min={0}
        max={300}
        value={liveInputGain}
        onChange={(_name, value) => setLiveInputGain(value)}
      />
    </div>
  );
}
