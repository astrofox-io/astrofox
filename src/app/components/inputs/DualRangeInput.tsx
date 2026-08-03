import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DualRangeInputProps {
  name?: string;
  value?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  onChange?: (name: string, value: [number, number]) => void;
  onUpdate?: (name: string, value: [number, number]) => void;
}

export default function DualRangeInput({
  name = 'range',
  value = [0, 0],
  min = 0,
  max = 1,
  step = 1,
  disabled = false,
  className,
  onChange,
  onUpdate,
}: DualRangeInputProps) {
  const [bufferedValue, setBufferedValue] = useState(value);
  const buffering = useRef(false);

  useEffect(() => {
    if (!buffering.current) {
      setBufferedValue(value);
    }
  }, [value]);

  function normalizeRange(nextValue: number[]): [number, number] {
    const start = Math.max(min, Math.min(max, nextValue[0] ?? min));
    const end = Math.max(start, Math.min(max, nextValue[1] ?? max));
    return [start, end];
  }

  function handleValueChange(nextValue: number[]) {
    const normalized = normalizeRange(nextValue);
    buffering.current = true;
    setBufferedValue(normalized);
    onUpdate?.(name, normalized);
  }

  function handleValueCommitted(nextValue: number[]) {
    buffering.current = false;
    onChange?.(name, normalizeRange(nextValue));
  }

  return (
    <SliderPrimitive.Root
      className={cn('relative h-6 w-full group', className)}
      value={bufferedValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={nextValue => handleValueChange(nextValue as number[])}
      onValueCommitted={nextValue => handleValueCommitted(nextValue as number[])}
    >
      <SliderPrimitive.Control className="flex h-6 w-full items-center">
        <SliderPrimitive.Track className="relative h-1.5 w-full rounded bg-neutral-700">
          <SliderPrimitive.Indicator
            className={cn('h-full rounded bg-primary', {
              hidden: disabled,
            })}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block size-3.5 rounded-full border border-border-input shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
            'bg-neutral-100',
            {
              invisible: disabled,
            },
          )}
        />
        <SliderPrimitive.Thumb
          className={cn(
            'block size-3.5 rounded-full border border-border-input shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
            'bg-neutral-100',
            {
              invisible: disabled,
            },
          )}
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
