import { clsx as classNames } from 'cnfast';
import type React from 'react';
import type { ReactElement } from 'react';
import Setting from '@/components/Setting';
import { inputValueToProps, mapChildren } from '@/lib/utils/react';

interface SettingsProps {
  label?: string;
  columns?: (string | number | undefined)[];
  className?: string;
  children?: React.ReactNode;
  onChange?: (props: Record<string, unknown>) => void;
}

export default function Settings({
  label,
  columns = [],
  className,
  children,
  onChange,
}: SettingsProps) {
  const [labelWidth, inputWidth] = columns;

  function handleClone(child: ReactElement, props: Record<string, unknown>) {
    if (child.type === Setting) {
      return [child, props] as unknown as ReactElement[];
    }
    return [child] as unknown as ReactElement[];
  }

  return (
    <div className={classNames('flex flex-col p-4', className)}>
      {label && (
        <div className={'text-neutral-500 text-xs uppercase tracking-wider mb-2'}>{label}</div>
      )}
      {mapChildren(
        children,
        {
          labelWidth,
          inputWidth,
          onChange: onChange ? inputValueToProps(onChange) : undefined,
        },
        handleClone,
      )}
    </div>
  );
}
