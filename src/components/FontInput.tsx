import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ComboboxInput from '@/components/ComboboxInput';
import { initializeFonts, useFonts } from '@/lib/fonts';

interface FontInputProps {
  name?: string;
  value?: string;
  onChange?: (name: string, value: string) => void;
}

export default function FontInput({ name = 'font', value = 'Inter', onChange }: FontInputProps) {
  const { t } = useTranslation();
  const families = useFonts(state => state.families);
  useEffect(() => {
    void initializeFonts();
  }, []);

  return (
    <ComboboxInput
      name={name}
      value={value}
      items={families}
      label={t('labels.font')}
      searchPlaceholder={t('inputs.search-fonts')}
      emptyMessage={t('inputs.no-fonts-found')}
      onChange={onChange}
    />
  );
}
