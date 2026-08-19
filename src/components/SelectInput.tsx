import type React from 'react';
import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SelectItemData {
  [key: string]: unknown;
  style?: React.CSSProperties;
}

interface SelectInputProps {
  name?: string;
  value?: string | number;
  items?: (SelectItemData | string | number | null)[];
  displayField?: string;
  valueField?: string;
  /** Fixed width in px; when omitted the select fills the remaining row space. */
  width?: number;
  optionsWidth?: number | string;
  className?: string;
  optionsClassName?: string;
  onChange?: (name: string, value: unknown) => void;
}

export default function SelectInput({
  name = 'select',
  value = '',
  items = [],
  displayField = 'label',
  valueField = 'value',
  width,
  optionsWidth,
  className,
  optionsClassName,
  onChange,
}: SelectInputProps) {
  const parsedItems = useMemo(() => {
    return items.map((item: SelectItemData | string | number | null) => {
      if (typeof item !== 'object') {
        return { [displayField]: item, [valueField]: item };
      }
      return item;
    });
  }, [items, displayField, valueField]);

  const selectedItem = useMemo(() => {
    return parsedItems.find(item => item && String(item[valueField]) === String(value));
  }, [parsedItems, value, valueField]);

  return (
    <Select
      value={value != null ? String(value) : undefined}
      onValueChange={val => {
        const original = parsedItems.find(item => item && String(item[valueField]) === val);
        onChange?.(name, original ? original[valueField] : val);
      }}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          // Compact field. Same border token as TextInput / SelectContent.
          'h-8 min-h-8 cursor-default text-sm text-neutral-300 bg-neutral-900 dark:bg-neutral-900',
          // Fixed width when given, otherwise fill the remaining row space.
          width === undefined ? 'min-w-0 flex-1' : 'w-auto',
          'border-border shadow-none hover:bg-neutral-900',
          'focus-visible:border-ring focus-visible:ring-0',
          'data-[size=sm]:h-8 data-[size=default]:h-8',
          className,
        )}
        style={width !== undefined ? { width } : undefined}
      >
        <span
          data-slot="select-value"
          className="flex flex-1 items-center gap-1.5 text-left line-clamp-1"
        >
          {selectedItem
            ? (selectedItem[displayField] as React.ReactNode)
            : value != null
              ? String(value)
              : ''}
        </span>
      </SelectTrigger>
      <SelectContent
        // Base UI's default overlays the selected item on the trigger and
        // disables the open/close animation; use a regular animated dropdown.
        alignItemWithTrigger={false}
        align="start"
        className={cn(
          // Grow to fit the longest option instead of clipping to the trigger width.
          'w-auto min-w-(--anchor-width) max-w-[min(90vw,32rem)]',
          'border border-border bg-neutral-900 text-neutral-300 ring-0',
          optionsClassName,
        )}
        style={optionsWidth != null ? { width: optionsWidth } : undefined}
      >
        {parsedItems.map((item: SelectItemData | null, index: number) => {
          if (!item) {
            const previousValue =
              parsedItems[index - 1] != null
                ? String(parsedItems[index - 1]?.[valueField])
                : 'start';
            const nextValue =
              parsedItems[index + 1] != null ? String(parsedItems[index + 1]?.[valueField]) : 'end';

            return <SelectSeparator key={`separator-${name}-${previousValue}-${nextValue}`} />;
          }
          const itemValue = String(item[valueField]);
          return (
            <SelectItem
              key={`${name}-${itemValue || index}`}
              value={itemValue}
              className="min-w-36 text-sm text-neutral-300 focus:bg-primary focus:text-neutral-100"
              style={item.style as React.CSSProperties | undefined}
            >
              {item[displayField] as React.ReactNode}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
