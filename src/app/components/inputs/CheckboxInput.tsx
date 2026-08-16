import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CheckboxInputProps {
  name?: string;
  value?: boolean;
  label?: string;
  labelPosition?: 'left' | 'right';
  onChange?: (name: string, value: boolean) => void;
}

export default function CheckboxInput({
  name = 'checkbox',
  value = false,
  label,
  labelPosition = 'right',
  onChange,
}: CheckboxInputProps) {
  const id = `checkbox-${name}`;

  return (
    <div className="flex items-center gap-2">
      {label && labelPosition === 'left' && (
        <Label htmlFor={id} className="order-0 font-normal text-neutral-300">
          {label}
        </Label>
      )}
      <Checkbox
        id={id}
        className={cn(
          'order-1 size-4 rounded border-border-input bg-neutral-900 shadow-none',
          'data-checked:border-primary data-checked:bg-primary data-checked:text-neutral-100',
        )}
        checked={value}
        onCheckedChange={checked => onChange?.(name, Boolean(checked))}
      />
      {label && labelPosition === 'right' && (
        <Label htmlFor={id} className="order-2 font-normal text-neutral-300">
          {label}
        </Label>
      )}
    </div>
  );
}
