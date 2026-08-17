import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TextInputProps {
  name?: string;
  width?: number | string;
  size?: number | null;
  value?: string | number;
  placeholder?: string;
  spellCheck?: boolean;
  autoFocus?: boolean;
  autoSelect?: boolean;
  buffered?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (name: string, value: string) => void;
}

export default function TextInput({
  name = 'text',
  width = 160,
  size = null,
  value = '',
  placeholder,
  spellCheck = false,
  autoFocus = false,
  autoSelect = false,
  buffered = false,
  readOnly = false,
  disabled = false,
  className,
  onChange,
}: TextInputProps) {
  const [bufferedValue, setBufferedValue] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  const shouldAutoFocus = useRef(Boolean(autoFocus));
  const shouldAutoSelect = useRef(Boolean(autoSelect));

  useEffect(() => {
    if (!input.current) {
      return;
    }

    if (shouldAutoFocus.current || shouldAutoSelect.current) {
      input.current.focus();
    }

    if (shouldAutoSelect.current) {
      input.current.select();
    }
  }, []);

  useEffect(() => {
    setBufferedValue(value);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.currentTarget.value;
    setBufferedValue(next);

    if (!buffered) {
      onChange?.(name, next);
    }
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (buffered) {
      if (e.key === 'Enter') {
        onChange?.(name, String(bufferedValue));
      } else if (e.key === 'Escape') {
        onChange?.(name, String(value));
      }
    }
  }

  function handleBlur() {
    if (buffered) {
      onChange?.(name, String(bufferedValue));
    }
  }

  return (
    <Input
      ref={input}
      type="text"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      className={cn(
        // Compact field. Use shadcn border token (#404040) — softer than border-input, still visible.
        'h-8 w-auto px-2 text-sm text-neutral-300 bg-neutral-900 dark:bg-neutral-900',
        'border-border shadow-none',
        'focus-visible:border-ring focus-visible:ring-0',
        'disabled:text-neutral-500',
        className,
      )}
      style={{ width }}
      name={name}
      size={size ?? undefined}
      spellCheck={spellCheck}
      value={buffered ? bufferedValue : value}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyUp={handleKeyUp}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
}
