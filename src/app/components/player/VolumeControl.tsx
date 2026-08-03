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

export default function VolumeControl() {
  const { liveModeEnabled, mode } = useAudioStore(
    useShallow(state => ({
      liveModeEnabled: state.liveModeEnabled,
      mode: state.mode,
    })),
  );
  const [state, setState] = useState(initialState);
  const { value, mute } = state;
  const VolumeIcon = getIcon();

  function persistState(nextValue: number, nextMute: boolean) {
    localStorage.setItem(STORAGE_KEY, String(nextValue));
    localStorage.setItem(STORAGE_MUTE_KEY, String(nextMute));
  }

  useEffect(() => {
    const rawValue = Number(localStorage.getItem(STORAGE_KEY));
    const storedMute = localStorage.getItem(STORAGE_MUTE_KEY) === 'true';
    const nextValue =
      Number.isFinite(rawValue) && rawValue >= 0 && rawValue <= 100 ? rawValue : 100;

    setState({ value: nextValue, mute: storedMute });
    player.setVolume(storedMute ? 0 : nextValue / 100);
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
