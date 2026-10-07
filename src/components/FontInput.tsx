import { useEffect } from 'react';
import SelectInput from '@/components/SelectInput';
import { initializeFonts, useFonts } from '@/lib/fonts';

interface FontInputProps {
  name?: string;
  value?: string;
  onChange?: (name: string, value: string) => void;
}

export default function FontInput({ name = 'font', value = 'Inter', onChange }: FontInputProps) {
  const families = useFonts(state => state.families);
  useEffect(() => {
    void initializeFonts();
  }, []);

  return (
    <SelectInput
      name={name}
      value={value}
      items={families}
      optionsClassName="max-h-80"
      onChange={(key, family) => onChange?.(key, String(family))}
    />
  );
}
