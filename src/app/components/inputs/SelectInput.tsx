import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type React from "react";
import { useMemo } from "react";

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
  width?: number;
  optionsWidth?: number | string;
  className?: string;
  optionsClassName?: string;
  onChange?: (name: string, value: unknown) => void;
}

export default function SelectInput({
  name = "select",
  value = "",
  items = [],
  displayField = "label",
  valueField = "value",
  width = 140,
  className,
  onChange,
}: SelectInputProps) {
  const parsedItems = useMemo(() => {
    return items.map((item: SelectItemData | string | number | null) => {
      if (typeof item !== "object") {
        return { [displayField]: item, [valueField]: item };
      }
      return item;
    });
  }, [items, displayField, valueField]);

  return (
    <Select
      value={value != null ? String(value) : undefined}
      onValueChange={(val) => {
        const original = parsedItems.find(
          (item) => item && String(item[valueField]) === val,
        );
        onChange?.(name, original ? original[valueField] : val);
      }}
    >
      <SelectTrigger
        className={cn(
          "h-auto cursor-default text-sm text-neutral-300 bg-neutral-900 border-border-input rounded py-1 px-2 shadow-none",
          className,
        )}
        style={{ width }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        className={cn(
          "bg-neutral-900 border-neutral-700 rounded shadow-lg p-1",
        )}
      >
        {parsedItems.map((item: SelectItemData | null, index: number) => {
          if (!item) {
            return <SelectSeparator key={index} />;
          }
          const itemValue = String(item[valueField]);
          return (
            <SelectItem
              key={index}
              value={itemValue}
              className="text-neutral-300 text-sm py-1 px-2 min-w-36 rounded focus:text-neutral-100 focus:bg-primary"
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
