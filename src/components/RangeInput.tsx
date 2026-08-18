import { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
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

  function handleValueChange(newValue: number | readonly number[]) {
    const raw = Array.isArray(newValue) ? newValue[0] : (newValue as number);
    const clamped = clampToLimits(raw);
    if (buffered) {
      buffering.current = true;
      setBufferedValue(clamped);
      onUpdate?.(name, clamped);
    } else {
      onChange?.(name, clamped);
    }
  }

  function handleValueCommitted(newValue: number | readonly number[]) {
    buffering.current = false;
    if (buffered) {
      const raw = Array.isArray(newValue) ? newValue[0] : (newValue as number);
      onChange?.(name, clampToLimits(raw));
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
    <Slider
      className={cn(
        'relative h-5 w-full group',
        '[&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-neutral-700',
        effectiveHideFill && '[&_[data-slot=slider-range]]:hidden',
        fillStyle === 'right' && '[&_[data-slot=slider-range]]:direction-rtl',
        fillStyle !== 'left' && fillStyle !== 'right' && '[&_[data-slot=slider-range]]:hidden',
        effectiveHideThumb && '[&_[data-slot=slider-thumb]]:invisible',
        effectiveHideThumb &&
          showThumbOnHover &&
          !sliderDisabled &&
          'group-hover:[&_[data-slot=slider-thumb]]:visible',
        smallThumb && '[&_[data-slot=slider-thumb]]:size-2.5',
        !smallThumb && '[&_[data-slot=slider-thumb]]:size-3.5',
        '[&_[data-slot=slider-thumb]]:border-border-input [&_[data-slot=slider-thumb]]:bg-neutral-100',
        '[&_[data-slot=slider-thumb]]:shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
        '[&_[data-slot=slider-thumb]]:hover:ring-0 [&_[data-slot=slider-thumb]]:focus-visible:ring-0',
        className,
      )}
      value={[sliderValue]}
      min={sliderMin}
      max={sliderMax}
      step={step}
      disabled={sliderDisabled}
      onValueChange={handleValueChange}
      onValueCommitted={handleValueCommitted}
    />
  );
}
