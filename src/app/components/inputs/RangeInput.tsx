import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RangeInputProps {
  name?: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  lowerLimit?: boolean | number;
  upperLimit?: boolean | number;
  buffered?: boolean;
  disabled?: boolean;
  fillStyle?: string;
  hideFill?: boolean;
  hideThumb?: boolean;
  showThumbOnHover?: boolean;
  smallThumb?: boolean;
  className?: string;
  onChange?: (name: string, value: number) => void;
  onUpdate?: (name: string, value: number) => void;
}

export default function RangeInput({
  name = 'range',
  value = 0,
  min = 0,
  max = 1,
  step = 1,
  lowerLimit = false,
  upperLimit = false,
  buffered = false,
  disabled = false,
  fillStyle = 'left',
  hideFill = false,
  hideThumb = false,
  showThumbOnHover = false,
  smallThumb = false,
  className,
  onChange,
  onUpdate,
}: RangeInputProps) {
  const [bufferedValue, setBufferedValue] = useState(value);
  const buffering = useRef(false);

  useEffect(() => {
    if (!buffering.current) {
      setBufferedValue(value);
    }
  }, [value]);

  function clampToLimits(val: number): number {
    let clamped = val;
    if (lowerLimit !== false && clamped < (lowerLimit as number)) {
      clamped = lowerLimit as number;
    }
    if (upperLimit !== false && clamped > (upperLimit as number)) {
      clamped = upperLimit as number;
    }
    return clamped;
  }

  function handleValueChange(newValue: number) {
    const clamped = clampToLimits(newValue);
    if (buffered) {
      buffering.current = true;
      setBufferedValue(clamped);
      onUpdate?.(name, clamped);
    } else {
      onChange?.(name, clamped);
    }
  }

  function handleValueCommitted(newValue: number) {
    buffering.current = false;
    if (buffered) {
      const clamped = clampToLimits(newValue);
      onChange?.(name, clamped);
    }
  }

  const currentValue = buffered ? bufferedValue : value;
  const hasValidRange = Number.isFinite(min) && Number.isFinite(max) && max > min;
  const sliderMin = Number.isFinite(min) ? min : 0;
  const sliderMax = Number.isFinite(max) && max > sliderMin ? max : sliderMin + 1;
  const sliderValue = hasValidRange ? currentValue : sliderMin;
  const sliderDisabled = disabled || !hasValidRange;
  const effectiveHideFill = hideFill || sliderDisabled;
  const effectiveHideThumb = hideThumb || sliderDisabled;

  return (
    <SliderPrimitive.Root
      className={cn('relative h-5 w-full group', className)}
      value={sliderValue}
      min={sliderMin}
      max={sliderMax}
      step={step}
      disabled={sliderDisabled}
      onValueChange={val => handleValueChange(val as number)}
      onValueCommitted={val => handleValueCommitted(val as number)}
    >
      <SliderPrimitive.Control className="flex w-full items-center h-5">
        <SliderPrimitive.Track className="relative h-1 w-full rounded bg-neutral-700">
          {!effectiveHideFill && (
            <SliderPrimitive.Indicator
              className={cn('h-full rounded bg-primary', {
                'direction-rtl': fillStyle === 'right',
                hidden: fillStyle !== 'left' && fillStyle !== 'right',
              })}
            />
          )}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block rounded-full bg-neutral-100 border border-border-input shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
            smallThumb ? 'size-2.5' : 'size-3.5',
            {
              invisible: effectiveHideThumb,
              'group-hover:visible': effectiveHideThumb && showThumbOnHover && !sliderDisabled,
            },
          )}
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
