import ColorInput from '@/components/ColorInput';
import { cn } from '@/lib/utils';

interface ColorRangeInputProps {
  name?: string;
  value?: [string, string];
  onChange?: (name: string, value: [string, string]) => void;
}

export default function ColorRangeInput({
  name = 'color',
  value = ['#ffffff', '#ffffff'],
  onChange,
}: ColorRangeInputProps) {
  const [startColor, endColor] = value;

  return (
    <div className="flex w-full flex-row items-center">
      <ColorInput
        name="startColor"
        value={startColor}
        onChange={(_n: string, next: string) => onChange?.(name, [next, endColor])}
      />
      <div
        className={cn('relative mx-2 my-0 h-4 flex-1 rounded border border-input')}
        style={{
          backgroundImage: `linear-gradient(to right, ${startColor}, ${endColor})`,
        }}
      />
      <ColorInput
        name="endColor"
        value={endColor}
        onChange={(_n: string, next: string) => onChange?.(name, [startColor, next])}
      />
    </div>
  );
}
