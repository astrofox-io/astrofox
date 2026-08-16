import { clsx as classNames } from 'cnfast';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useAudioStore from '@/app/actions/audio';
import { RangeInput } from '@/app/components/inputs';
import { player } from '@/app/global';
import { Volume, Volume2, Volume3, Volume4 } from '@/app/icons';

const STORAGE_KEY = 'astrofox.player.volume';
const STORAGE_MUTE_KEY = 'astrofox.player.volumeMuted';

const initialState = {
  value: 100,
  mute: false,
};

function readStoredState() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    const parsed = rawValue === null ? Number.NaN : Number(rawValue);
    const value = Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : 100;
    const mute = localStorage.getItem(STORAGE_MUTE_KEY) === 'true';

    return { value, mute };
  } catch {
    return initialState;
  }
}

export default function VolumeControl() {
  const { liveModeEnabled, mode } = useAudioStore(
    useShallow(state => ({
      liveModeEnabled: state.liveModeEnabled,
      mode: state.mode,
    })),
  );
  const [state, setState] = useState(readStoredState);
  const { value, mute } = state;
  const VolumeIcon = getIcon();

  function persistState(nextValue: number, nextMute: boolean) {
    try {
      localStorage.setItem(STORAGE_KEY, String(nextValue));
      localStorage.setItem(STORAGE_MUTE_KEY, String(nextMute));
    } catch {
      // storage unavailable
    }
  }

  useEffect(() => {
    // Apply the restored setting to the player once on mount.
    player.setVolume(mute ? 0 : value / 100);
  }, []);

  if (liveModeEnabled && (mode === 'microphone' || mode === 'desktop' || mode === 'midi')) {
    return null;
  }

  function handleChange(_name: string, value: number) {
    setState({ value, mute: false });
    player.setVolume(value / 100);
    persistState(value, false);
  }

  function handleClick() {
    setState(prevState => {
      const nextMute = !prevState.mute;
      player.setVolume(nextMute ? 0 : prevState.value / 100);
      persistState(prevState.value, nextMute);

      return { ...prevState, mute: nextMute };
    });
  }

  function getIcon() {
    let icon = null;

    if (value < 10 || mute) {
      icon = Volume4;
    } else if (value < 25) {
      icon = Volume3;
    } else if (value < 75) {
      icon = Volume2;
    } else {
      icon = Volume;
    }

    return icon;
  }

  return (
    <div className={'flex'}>
      <button
        type="button"
        className={classNames(
          'mr-3 inline-flex h-4 w-4 items-center justify-center text-neutral-100',
          { 'text-neutral-400': mute },
        )}
        onClick={handleClick}
      >
        <VolumeIcon className={'text-inherit'} />
      </button>
      <div className={'flex items-center w-24'}>
        <RangeInput
          name="volume"
          min={0}
          max={100}
          value={mute ? 0 : value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
