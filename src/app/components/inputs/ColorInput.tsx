import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ColorInputProps {
  name?: string;
  value?: string;
  onChange?: (name: string, value: string) => void;
}

export default function ColorInput({
  name = 'color',
  value = '#ffffff',
  onChange,
}: ColorInputProps) {
  return (
    <div
      className={cn(
        'flex size-6 items-center justify-center rounded-full border border-input bg-neutral-900 shadow-xs',
      )}
    >
      <Input
        type="color"
        className={cn(
          'size-4 min-w-0 rounded-full border-0 bg-transparent p-0 shadow-none',
          'focus-visible:border-0 focus-visible:ring-0',
          '[&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0',
          '[&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0',
        )}
        name={name}
        value={value}
        style={{ backgroundColor: value }}
        onChange={e => onChange?.(name, e.target.value)}
      />
    </div>
  );
}
