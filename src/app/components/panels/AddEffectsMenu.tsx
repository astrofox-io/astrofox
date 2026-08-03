import { useTranslation } from 'react-i18next';
import SectionAddMenu from './SectionAddMenu';

interface AddEffectsMenuProps {
  sceneId: string;
}

export default function AddEffectsMenu({ sceneId }: AddEffectsMenuProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'add-menu' });

  const categories = [
    {
      label: t('category-color'),
      items: ['Color'],
    },
    {
      label: t('category-blur-focus'),
      items: ['Blur', 'Bloom', 'Depth of Field', 'Tilt Shift'],
    },
    {
      label: t('category-distortion'),
      items: ['Distortion', 'Glitch', 'Kaleidoscope', 'Mirror', 'RGB Shift'],
    },
    {
      label: t('category-pattern'),
      items: ['ASCII', 'Color Halftone', 'Dot Screen', 'LED', 'Pixelate', 'Scanline'],
    },
    {
      label: t('category-stylize'),
      items: ['Noise', 'Perlin Noise', 'Vignette'],
    },
  ];

  return (
    <SectionAddMenu
      sceneId={sceneId}
      entityType="effects"
      categories={categories}
      ariaLabel={t('add-effect')}
    />
  );
}
