import { Diamond } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toggleKeyAtPlayhead } from '@/app/actions/keyframes';
import { Button } from '@/components/ui/button';
import { snapToFrame } from '@/lib/timeline/clip';
import { keyIndexAt, type Track } from '@/lib/timeline/tracks';
import transportStore from '@/lib/timeline/transport';
import { cn } from '@/lib/utils';

interface KeyframeButtonProps {
  id: string;
  name: string;
  track: Track | undefined;
  className?: string;
}

/**
 * ◇ next to an animatable control. Hollow: static. Outlined in the primary
 * colour: animated, no key at the playhead. Solid: a key at the playhead.
 * Clicking starts animating, adds a key, or removes the key at the playhead.
 */
export default function KeyframeButton({ id, name, track, className }: KeyframeButtonProps) {
  const { t } = useTranslation();
  // Only animated properties follow the playhead, so static rows never re-render while playing.
  const onKey = transportStore(state =>
    track ? keyIndexAt(track, snapToFrame(state.time, state.fps)) > -1 : false,
  );

  const label = !track
    ? t('timeline.animate')
    : onKey
      ? t('timeline.remove-keyframe')
      : t('timeline.add-keyframe');

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      aria-pressed={onKey}
      className={cn(
        'min-h-5 min-w-5 shrink-0 border-0 bg-transparent p-0 hover:bg-transparent',
        track ? 'text-primary hover:text-primary/80' : 'text-neutral-500 hover:text-neutral-100',
        className,
      )}
      onClick={() => toggleKeyAtPlayhead(id, name)}
    >
      <Diamond className={cn('h-3 w-3', { 'fill-current': onKey })} />
    </Button>
  );
}
