import classNames from "classnames";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface TextInputProps {
  name?: string;
  width?: number;
  size?: number | null;
  value?: string | number;
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
  name = "text",
  width = 160,
  size = null,
  value = "",
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
    const { value } = e.currentTarget;

    setBufferedValue(value);

    if (!buffered) {
      onChange?.(name, value);
    }
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (buffered) {
      // Enter key
      if (e.keyCode === 13) {
        onChange?.(name, String(bufferedValue));
      }
      // Esc key
      else if (e.keyCode === 27) {
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
    <input
      ref={input}
      type="text"
      className={classNames(
        "text-sm text-neutral-300 bg-neutral-900 border border-border-input rounded py-1 px-2 [outline:none] [&:focus]:border [&:focus]:border-primary [&:read-only]:border-border-input [&:disabled]:text-neutral-500 [&:disabled]:border-border-input",
        className,
      )}
      style={{ width }}
      name={name}
      size={size ?? undefined}
      spellCheck={spellCheck}
      value={buffered ? bufferedValue : value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyUp={handleKeyUp}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
}
