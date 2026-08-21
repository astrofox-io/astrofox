import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface ControlGroupProps {
  title: string;
  defaultOpen?: boolean;
  /** Optional enable/disable switch shown at the right of the header row. */
  toggle?: {
    name: string;
    value: boolean;
    onChange: (name: string, value: boolean) => void;
  };
  children: React.ReactNode;
}

/**
 * Collapsible section inside a control card. The header carries a chevron and
 * the title (plus an optional enable switch); the grouped options sit on a
 * darker background so the grouping is visually unambiguous.
 */
export default function ControlGroup({
  title,
  defaultOpen = false,
  toggle,
  children,
}: ControlGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const hasContent = React.Children.toArray(children).some(child => child !== null);

  return (
    <div className="mx-2 overflow-hidden">
      <div className="flex items-center gap-1 pr-2.5">
        <button
          type="button"
          aria-expanded={open}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1 py-1.5 pl-2.5 pr-1.5 text-left text-xs uppercase text-neutral-400 hover:text-neutral-100"
          onClick={() => setOpen(value => !value)}
        >
          <ChevronRight
            className={cn('size-3 shrink-0 transition-transform', { 'rotate-90': open })}
          />
          <span className="truncate">{title}</span>
        </button>
        {toggle ? (
          <Switch
            size="sm"
            aria-label={title}
            checked={toggle.value}
            onCheckedChange={checked => toggle.onChange(toggle.name, Boolean(checked))}
          />
        ) : null}
      </div>
      {open && hasContent ? (
        <div className="flex flex-col py-2 gap-3 border-l-1 border-border ml-3.5">{children}</div>
      ) : null}
    </div>
  );
}
