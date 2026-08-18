import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ToggleInputProps {
  name?: string;
  value?: boolean;
  label?: string;
  labelPosition?: 'left' | 'right';
  onChange?: (name: string, value: boolean) => void;
}

export default function ToggleInput({
  name = 'toggle',
  value = false,
  label,
  labelPosition = 'right',
  onChange,
}: ToggleInputProps) {
  const id = `toggle-${name}`;

  return (
    <div className="flex items-center gap-2">
      {label && labelPosition === 'left' && (
        <Label htmlFor={id} className="order-0 font-normal text-neutral-300">
          {label}
        </Label>
      )}
      <Switch
        id={id}
        className="order-1"
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
