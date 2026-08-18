import { useState } from 'react';
import TextInput from '@/components/TextInput';
import { formatSeekTime, parseSeekTime } from '@/lib/utils/format';
import { clamp } from '@/lib/utils/math';

interface TimeInputProps {
  name?: string;
  value?: number;
  width?: number | string;
  size?: number | null;
  min?: number;
  max?: number;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (name: string, value: number) => void;
}

export default function TimeInput({
  name = 'time',
  value = 0,
  width = 140,
  size,
  min,
  max,
  readOnly = false,
  disabled = false,
  onChange,
}: TimeInputProps) {
  const [key, setKey] = useState(0);

  function handleChange(name: string, value: string) {
    let time = parseSeekTime(value);

    if (time !== null) {
      if (min !== undefined && max !== undefined) {
        if (time < min || time > max) {
          setKey(key + 1);
        }
        time = clamp(time, min, max);
      }

      onChange?.(name, time);
    } else {
      setKey(key + 1);
    }
  }

  return (
    <TextInput
      key={key}
      name={name}
      width={width}
      size={size}
      buffered
      readOnly={readOnly}
      disabled={disabled}
      value={formatSeekTime(value)}
      onChange={handleChange}
    />
  );
}
