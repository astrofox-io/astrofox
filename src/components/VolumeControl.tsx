import { clsx as classNames } from 'cnfast';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useAudioStore from '@/app/actions/audio';
import { player } from '@/app/global';
import { Volume, Volume2, Volume3, Volume4 } from '@/app/icons';
import RangeInput from '@/components/RangeInput';
import { getBoolean, getNumber, setBoolean, setNumber } from '@/lib/storage';

const STORAGE_KEY = 'astrofox.player.volume';
const STORAGE_MUTE_KEY = 'astrofox.player.volumeMuted';

const initialState = {
  value: 100,
  mute: false,
};

function readStoredState() {
  const stored = getNumber(STORAGE_KEY, initialState.value);
  const value = stored >= 0 && stored <= 100 ? stored : initialState.value;
  const mute = getBoolean(STORAGE_MUTE_KEY, initialState.mute);

  return { value, mute };
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
    setNumber(STORAGE_KEY, nextValue);
    setBoolean(STORAGE_MUTE_KEY, nextMute);
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
