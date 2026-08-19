import CheckboxInput from '@/components/CheckboxInput';
import ColorInput from '@/components/ColorInput';
import ColorRangeInput from '@/components/ColorRangeInput';
import ImageInput from '@/components/ImageInput';
import NumberInput from '@/components/NumberInput';
import RangeInput from '@/components/RangeInput';
import SelectInput from '@/components/SelectInput';
import TextInput from '@/components/TextInput';
import TimeInput from '@/components/TimeInput';
import ToggleInput from '@/components/ToggleInput';
import VideoInput from '@/components/VideoInput';

type InputComponentEntry = [React.ComponentType<Record<string, unknown>>, Record<string, unknown>?];

const inputComponents: Record<string, InputComponentEntry> = {
  text: [TextInput as unknown as React.ComponentType<Record<string, unknown>>],
  number: [NumberInput as unknown as React.ComponentType<Record<string, unknown>>, { width: 40 }],
  toggle: [ToggleInput as unknown as React.ComponentType<Record<string, unknown>>],
  checkbox: [CheckboxInput as unknown as React.ComponentType<Record<string, unknown>>],
  color: [ColorInput as unknown as React.ComponentType<Record<string, unknown>>],
  colorrange: [ColorRangeInput as unknown as React.ComponentType<Record<string, unknown>>],
  range: [RangeInput as unknown as React.ComponentType<Record<string, unknown>>],
  select: [SelectInput as unknown as React.ComponentType<Record<string, unknown>>],
  image: [ImageInput as unknown as React.ComponentType<Record<string, unknown>>],
  video: [VideoInput as unknown as React.ComponentType<Record<string, unknown>>],
  time: [TimeInput as unknown as React.ComponentType<Record<string, unknown>>],
};

export default inputComponents;
