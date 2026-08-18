import { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
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

  function handleValueChange(nextValue: number | readonly number[]) {
    const normalized = normalizeRange([...(nextValue as number[])]);
    buffering.current = true;
    setBufferedValue(normalized);
    onUpdate?.(name, normalized);
  }

  function handleValueCommitted(nextValue: number | readonly number[]) {
    buffering.current = false;
    onChange?.(name, normalizeRange([...(nextValue as number[])]));
  }

  return (
    <Slider
      className={cn(
        'relative h-6 w-full group',
        '[&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-neutral-700',
        disabled && '[&_[data-slot=slider-range]]:hidden',
        '[&_[data-slot=slider-thumb]]:size-3.5',
        '[&_[data-slot=slider-thumb]]:border-border-input [&_[data-slot=slider-thumb]]:bg-neutral-100',
        '[&_[data-slot=slider-thumb]]:shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
        '[&_[data-slot=slider-thumb]]:hover:ring-0 [&_[data-slot=slider-thumb]]:focus-visible:ring-0',
        disabled && '[&_[data-slot=slider-thumb]]:invisible',
        className,
      )}
      value={bufferedValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={handleValueChange}
      onValueCommitted={handleValueCommitted}
    />
  );
}
