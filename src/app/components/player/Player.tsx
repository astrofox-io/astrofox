import useAudioStore from '@/app/actions/audio';
import AudioWaveform from './AudioWaveform';
import LiveInputButton from './LiveInputButton';
import LiveInputGain from './LiveInputGain';
import LiveModePanel from './LiveModePanel';
import LiveModeToggle from './LiveModeToggle';
import LiveOscilloscope, { LIVE_SCOPE_WIDTH } from './LiveOscilloscope';
import PlayButtons from './PlayButtons';

import ProgressControl from './ProgressControl';
import ToggleButtons from './ToggleButtons';
import VolumeControl from './VolumeControl';

export default function Player() {
  const liveModeEnabled = useAudioStore(state => state.liveModeEnabled);

  return (
    <div className="shrink-0">
      <AudioWaveform />
      <LiveOscilloscope />
      <div className="min-w-lg overflow-hidden border-t border-t-neutral-800 bg-neutral-900 px-5 py-2.5">
        {liveModeEnabled ? (
          <div
            className="mx-auto flex w-full items-center justify-between gap-4"
            style={{ maxWidth: LIVE_SCOPE_WIDTH }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <LiveModePanel />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <LiveInputGain />
              <LiveInputButton />
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center [&_>_div]:mr-5 [&_>_div:last-child]:mr-0">
            <PlayButtons />
            <VolumeControl />
            <ProgressControl />
            <ToggleButtons />
            <div className="ml-auto mr-0 flex items-center">
              <LiveModeToggle mode="enable" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
