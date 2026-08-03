import { useTranslation } from 'react-i18next';
import SectionAddMenu from './SectionAddMenu';

interface Add2DDisplaysMenuProps {
  sceneId: string;
}

export default function Add2DDisplaysMenu({ sceneId }: Add2DDisplaysMenuProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'add-menu' });

  const categories = [
    {
      label: t('category-2d'),
      items: [
        'Text',
        'Image',
        'Video',
        'Shape',
        'Bar Spectrum',
        'Radial Spectrum',
        'Wave Spectrum',
        'Waveform Ring',
        'Sound Wave',
      ],
    },
  ];

  return (
    <SectionAddMenu
      sceneId={sceneId}
      entityType="displays"
      categories={categories}
      ariaLabel={t('add-2d-display')}
    />
  );
}
