import { clsx as classNames } from 'cnfast';
import type React from 'react';
import { setAnimatedValue } from '@/app/actions/keyframes';
import { useDocument } from '@/app/document';
import usePlayheadTime from '@/app/hooks/usePlayheadTime';
import { Link } from '@/app/icons';
import inputComponents from '@/components/inputComponents';
import KeyframeButton from '@/components/KeyframeButton';
import RangeInput from '@/components/RangeInput';
import ReactorButton from '@/components/ReactorButton';
import ReactorInput from '@/components/ReactorInput';
import type Display from '@/lib/core/Display';
import { evaluateTrack, type TrackType, trackTypeFor } from '@/lib/timeline/tracks';

interface OptionProps {
  display: Display & { properties: Record<string, unknown> };
  label?: string;
  type?: string;
  name: string;
  value?: unknown;
  className?: string;
  onChange?: (name: string | Record<string, unknown>, value?: unknown) => void;
  hidden?: boolean;
  withReactor?: boolean;
  withRange?: boolean;
  withLink?: string;
  inputProps?: Record<string, unknown>;
  min?: number;
  max?: number;
  /** False keeps a number or colour control from being animated. */
  animatable?: boolean;
  /** Keys may go past min/max (rotation); the input shows the value wrapped into range. */
  unbounded?: boolean;
  [key: string]: unknown;
}

/** Which kind of track this control animates, or null. Reactors and other non-layers never animate. */
function animatableAs(display: OptionProps['display'], name: string): TrackType | null {
  const config = (display.constructor as { config?: Parameters<typeof trackTypeFor>[0] }).config;
  return 'tracks' in display && config ? trackTypeFor(config, name) : null;
}

/** A value wrapped into min..max, for unbounded controls whose keys can go round. */
function wrap(value: number, min: number, max: number) {
  const span = max - min;
  return span > 0 ? min + ((((value - min) % span) + span) % span) : value;
}

export default function Option({
  display,
  label,
  type,
  name,
  value,
  className,
  onChange,
  hidden,
  withReactor,
  withRange,
  withLink,
  inputProps,
  animatable: _animatable,
  unbounded,
  ...otherProps
}: OptionProps) {
  const [InputCompnent, defaultProps] = type ? (inputComponents[type] ?? []) : [];
  const trackType = animatableAs(display, name);
  const track = useDocument(state => {
    if (!trackType) return undefined;
    const layer = state.elementById[display.id] ?? state.sceneById[display.id];
    return layer?.tracks?.[name];
  });
  // An animated control shows its value at the playhead and edits the key
  // there. While playing it follows at a reduced rate, so a panel full of
  // animated controls does not re-render on every frame.
  const time = usePlayheadTime(Boolean(track));

  if (track) {
    const animated = evaluateTrack(track, time);
    value =
      unbounded &&
      typeof animated === 'number' &&
      typeof otherProps.min === 'number' &&
      typeof otherProps.max === 'number'
        ? wrap(animated, otherProps.min, otherProps.max)
        : animated;
    const edit = onChange;
    onChange = (key, next) => {
      if (key === name && (typeof next === 'number' || typeof next === 'string')) {
        setAnimatedValue(display.id, name, next);
      } else {
        // Other keys from this row (the link toggle) stay ordinary edits.
        edit?.(key, next);
      }
    };
  }

  const showReactor = withReactor && display.getReactor?.(name);
  const linked = Boolean(withLink && display.properties[withLink]);
  const { min, max } = otherProps;
  const inputs: React.ReactNode[] = [];

  if (showReactor) {
    inputs.push(<ReactorInput key="reactor" display={display} name={name} value={value} />);
  } else if (InputCompnent) {
    const resolvedInputProps =
      type === 'number' && inputProps?.width === undefined
        ? { ...inputProps, width: 64 }
        : inputProps;

    inputs.push(
      <InputCompnent
        key="input"
        {...defaultProps}
        {...resolvedInputProps}
        {...otherProps}
        name={name}
        value={value}
        onChange={onChange}
      />,
    );

    if (withRange) {
      inputs.push(
        <RangeInput
          key="range"
          {...otherProps}
          name={name}
          value={value as number}
          onChange={onChange as (name: string, value: number) => void}
          smallThumb
        />,
      );
    }
  }

  return (
    <div
      className={classNames(
        'relative my-0 mx-2.5 flex flex-row items-center gap-2 px-0 text-sm text-neutral-400 leading-5',
        className,
        {
          hidden: hidden || inputs.length === 0,
        },
      )}
    >
      {withReactor && (
        <ReactorButton
          className={'!absolute -left-1 top-1/2 -translate-y-1/2'}
          display={display}
          name={name}
          min={min}
          max={max}
        />
      )}
      <div className="ml-6 flex min-w-28 cursor-default">
        <div className="mr-2 flex-1 overflow-hidden whitespace-nowrap text-ellipsis">{label}</div>
        {withLink && (
          <Link
            className={classNames('h-3.5 w-3.5', {
              'text-neutral-100': linked,
              'text-neutral-500 opacity-50': !linked,
            })}
            onClick={() => onChange?.(withLink, !display.properties[withLink])}
          />
        )}
      </div>
      {inputs}
      {trackType && inputs.length > 0 && (
        <KeyframeButton id={display.id} name={name} track={track} className="-mr-1" />
      )}
    </div>
  );
}
