import { clsx as classNames } from 'cnfast';
import type React from 'react';

import inputComponents from './inputComponents';

interface SettingProps {
  label?: string;
  description?: string;
  type?: string;
  name?: string;
  value?: unknown;
  className?: string;
  labelWidth?: number;
  inputWidth?: number;
  onChange?: (name: string | Record<string, unknown>, value?: unknown) => void;
  hidden?: boolean;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export default function Setting({
  label,
  description,
  type,
  name,
  value,
  className,
  labelWidth,
  inputWidth,
  onChange,
  hidden,
  children,
  ...otherProps
}: SettingProps) {
  const [InputCompnent, inputProps] = type ? (inputComponents[type] ?? []) : [];

  return (
    <div
      className={classNames(
        'flex items-center mb-4 [&_>_*]:mr-2 [&_>_*:last-child]:mr-0',
        className,
        {
          hidden: hidden,
        },
      )}
    >
      <div className={'text-neutral-300'} style={{ width: labelWidth }}>
        {label}
        {description && <div className="mt-1 text-xs text-neutral-500">{description}</div>}
      </div>
      <div style={{ width: inputWidth }}>
        {InputCompnent && (
          <InputCompnent
            {...inputProps}
            {...otherProps}
            name={name}
            value={value}
            onChange={onChange}
          />
        )}
        {children}
      </div>
    </div>
  );
}
