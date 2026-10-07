'use client';

import { Combobox } from '@base-ui/react/combobox';
import { CheckIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import { useRef } from 'react';

interface ComboboxInputProps {
  name: string;
  value: string;
  items: string[];
  label: string;
  searchPlaceholder: string;
  emptyMessage: string;
  onChange?: (name: string, value: string) => void;
}

export default function ComboboxInput({
  name,
  value,
  items,
  label,
  searchPlaceholder,
  emptyMessage,
  onChange,
}: ComboboxInputProps) {
  const searchInput = useRef<HTMLInputElement>(null);

  return (
    <Combobox.Root
      name={name}
      value={value}
      items={items}
      autoHighlight
      onValueChange={selected => {
        if (selected !== null) onChange?.(name, selected);
      }}
    >
      <Combobox.Trigger
        aria-label={label}
        className="flex h-8 min-w-0 flex-1 cursor-default items-center justify-between gap-1.5 rounded border border-border bg-neutral-900 py-2 pr-2 pl-2.5 text-sm text-neutral-300 outline-none focus-visible:border-ring"
      >
        <span className="flex-1 truncate text-left">{value}</span>
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} align="start" className="isolate z-50">
          <Combobox.Popup
            initialFocus={searchInput}
            className="flex max-h-[min(var(--available-height),24rem)] w-(--anchor-width) min-w-56 max-w-[90vw] flex-col overflow-hidden rounded border border-border bg-neutral-900 text-neutral-300 shadow-[0_14px_36px_rgba(0,0,0,0.42)]"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
              <SearchIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
              <Combobox.Input
                ref={searchInput}
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                spellCheck={false}
                className="h-6 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Combobox.Empty className="px-3 text-sm text-muted-foreground [&:not(:empty)]:py-2">
              {emptyMessage}
            </Combobox.Empty>
            <Combobox.List className="min-h-0 overflow-y-auto overscroll-contain p-1">
              {(item: string) => (
                <Combobox.Item
                  key={item}
                  value={item}
                  className="relative flex cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-highlighted:bg-primary data-highlighted:text-neutral-100"
                >
                  <span className="truncate">{item}</span>
                  <Combobox.ItemIndicator className="pointer-events-none absolute right-2">
                    <CheckIcon className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
