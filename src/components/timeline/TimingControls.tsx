import { useTranslation } from 'react-i18next';
import useScenes from '@/app/actions/scenes';
import { clearElementClip, setElementClip } from '@/app/actions/timeline';
import NumberInput from '@/components/NumberInput';
import { Button } from '@/components/ui/button';
import type Display from '@/lib/core/Display';
import type { Clip } from '@/lib/timeline/clip';
import transportStore from '@/lib/timeline/transport';

interface TimingControlsProps {
  display: Display;
}

function Row({
  label,
  name,
  value,
  max,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="relative my-0 mx-2.5 flex flex-row items-center gap-2 px-0 text-sm text-neutral-400 leading-5">
      <div className="ml-6 flex min-w-28 cursor-default">
        <div className="mr-2 flex-1 overflow-hidden whitespace-nowrap text-ellipsis">{label}</div>
      </div>
      <NumberInput
        name={name}
        value={Math.round(value * 100) / 100}
        width={64}
        min={0}
        max={max}
        step={0.01}
        onChange={(_name, next) => onChange(next)}
      />
      <span className="text-xs text-neutral-500">s</span>
    </div>
  );
}

/**
 * The "Timing" group in the controls panel: start, end and fades of the
 * element's clip, so timing is editable without opening the timeline.
 */
export default function TimingControls({ display }: TimingControlsProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'timeline' });
  const duration = transportStore(state => state.duration);
  const clip = useScenes(
    state =>
      (
        (state.elementById as Record<string, { clip?: Clip | null }>)[display.id] ??
        (state.sceneById as Record<string, { clip?: Clip | null }>)[display.id]
      )?.clip ?? null,
  ) as Clip | null;
  const start = clip?.start ?? 0;
  const end = clip?.end ?? duration;
  const hasOpacity = typeof display.authoredProperties.opacity === 'number';

  return (
    <>
      <Row
        label={t('start')}
        name="start"
        value={start}
        max={duration}
        onChange={value => setElementClip(display.id, { start: Math.min(value, end - 0.01) })}
      />
      <Row
        label={t('end')}
        name="end"
        value={end}
        max={duration}
        onChange={value =>
          setElementClip(display.id, {
            end: value >= duration ? null : Math.max(value, start + 0.01),
          })
        }
      />
      {hasOpacity ? (
        <>
          <Row
            label={t('fade-in')}
            name="fadeIn"
            value={clip?.fadeIn ?? 0}
            max={duration}
            onChange={value => setElementClip(display.id, { fadeIn: value })}
          />
          <Row
            label={t('fade-out')}
            name="fadeOut"
            value={clip?.fadeOut ?? 0}
            max={duration}
            onChange={value => setElementClip(display.id, { fadeOut: value })}
          />
        </>
      ) : (
        <div className="mx-2.5 ml-8.5 text-xs text-neutral-500">{t('no-fades')}</div>
      )}
      {clip ? (
        <div className="mx-2.5 ml-8.5">
          <Button variant="secondary" size="sm" onClick={() => clearElementClip(display.id)}>
            {t('reset')}
          </Button>
        </div>
      ) : null}
    </>
  );
}
