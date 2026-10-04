import { AlignStartVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAppStore from '@/app/actions/app';
import useAudioStore from '@/app/actions/audio';
import useTimelinePanel, { toggleTimelineOpen } from '@/app/actions/timelinePanel';
import { Cycle } from '@/app/icons';
import IconToggleButton from '@/components/IconToggleButton';
import transportStore, { setTransportLoop } from '@/lib/timeline/transport';

export default function ToggleButtons() {
  const { t } = useTranslation(undefined, { keyPrefix: 'player' });
  const isVideoRecording = useAppStore(state => state.isVideoRecording);
  const liveModeEnabled = useAudioStore(state => state.liveModeEnabled);
  const timelineOpen = useTimelinePanel(state => state.open);
  const looping = transportStore(state => state.loop);

  if (isVideoRecording || liveModeEnabled) {
    return null;
  }

  function handleLoopButtonClick() {
    setTransportLoop(!looping);
  }

  return (
    <div className="flex gap-2.5">
      <IconToggleButton label={t('repeat')} pressed={looping} onClick={handleLoopButtonClick}>
        <Cycle className="size-4" />
      </IconToggleButton>
      <IconToggleButton
        label={t(timelineOpen ? 'hide-timeline' : 'show-timeline')}
        pressed={timelineOpen}
        onClick={toggleTimelineOpen}
      >
        <AlignStartVertical className="size-4" />
      </IconToggleButton>
    </div>
  );
}
