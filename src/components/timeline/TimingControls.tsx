import { useTranslation } from 'react-i18next';
import { projectDocument, useDocument } from '@/app/document';
import NumberInput from '@/components/NumberInput';
import { Button } from '@/components/ui/button';
import type Display from '@/lib/core/Display';
import type { Clip, ClipPatch } from '@/lib/timeline/clip';
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
  const clip: Clip | null = useDocument(
    state => (state.elementById[display.id] ?? state.sceneById[display.id])?.clip ?? null,
  );
  const setClip = (patch: ClipPatch) =>
    projectDocument.apply({ type: 'setClip', id: display.id, patch });
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
        onChange={value => setClip({ start: Math.min(value, end - 0.01) })}
      />
      <Row
        label={t('end')}
        name="end"
        value={end}
        max={duration}
        onChange={value =>
          setClip({
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
            onChange={value => setClip({ fadeIn: value })}
          />
          <Row
            label={t('fade-out')}
            name="fadeOut"
            value={clip?.fadeOut ?? 0}
            max={duration}
            onChange={value => setClip({ fadeOut: value })}
          />
        </>
      ) : (
        <div className="mx-2.5 ml-8.5 text-xs text-neutral-500">{t('no-fades')}</div>
      )}
      {clip ? (
        <div className="mx-2.5 ml-8.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => projectDocument.apply({ type: 'clearClip', id: display.id })}
          >
            {t('reset')}
          </Button>
        </div>
      ) : null}
    </>
  );
}
