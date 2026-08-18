import { useTranslation } from 'react-i18next';
import useStage, { fitToScreen, setZoom, zoomIn, zoomOut } from '@/app/actions/stage';
import RangeInput from '@/components/RangeInput';
import { Button } from '@/components/ui/button';

export default function Zoom() {
  const { t } = useTranslation(undefined, { keyPrefix: 'zoom' });
  const { width, height, zoom } = useStage(state => state);
  const canvasSizeLabel = t('reset-zoom-to-canvas-size', { width, height });
  const zoomLevelLabel = t('zoom-level', { zoom: ~~(zoom * 100) });

  return (
    <div className={'flex w-full items-center justify-center gap-2 leading-7 overflow-hidden'}>
      <Button
        variant="ghost"
        className="h-7 bg-transparent p-0 text-inherit hover:bg-transparent"
        aria-label={canvasSizeLabel}
        onClick={() => setZoom(1)}
      >
        {`${width} x ${height}`}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-7 text-sm bg-transparent text-inherit p-0 hover:bg-primary"
        aria-label={t('zoom-out')}
        onClick={zoomOut}
      >
        {'\uff0d'}
      </Button>
      <div className="flex w-24 items-center" title={zoomLevelLabel}>
        <RangeInput
          name="zoom"
          value={zoom}
          min={0.1}
          max={3}
          step={0.02}
          smallThumb
          // Status bar is primary-colored, so use white for the fill/thumb.
          className="[&_[data-slot=slider-track]]:h-0.5 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-track]]:bg-white/30 [&_[data-slot=slider-thumb]]:size-2 [&_[data-slot=slider-thumb]]:border-white"
          onChange={(_name, value) => setZoom(value)}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-7 text-sm bg-transparent text-inherit p-0 hover:bg-primary"
        aria-label={t('zoom-in')}
        onClick={zoomIn}
      >
        {'\uff0b'}
      </Button>
      <Button
        variant="ghost"
        className="w-12 h-7 text-center bg-transparent text-inherit p-0 hover:bg-transparent"
        aria-label={t('fit-to-screen')}
        onClick={fitToScreen}
      >
        {`${~~(zoom * 100)}%`}
      </Button>
    </div>
  );
}
