import { type ReactNode, useEffect, useState } from 'react';
import useAppStore from '@/app/actions/app';
import { env, renderer } from '@/app/global';
import ZoomControl from '@/components/ZoomControl';

const { APP_VERSION } = env;

interface StatsState {
  fps?: number | null;
}

export default function StatusBar() {
  const statusText = useAppStore(state => state.statusText);
  const [{ fps }, setState] = useState<StatsState>({ fps: null });

  function updateStats() {
    const currentFPS = renderer.getFPS();

    setState({
      fps: renderer.rendering ? currentFPS : null,
    });
  }

  useEffect(() => {
    const id = window.setInterval(updateStats, 500);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  return (
    <div
      className={
        'flex text-neutral-100 bg-primary text-sm py-0 px-5 cursor-default whitespace-nowrap z-[1]'
      }
    >
      <div className={'text-left w-1/3 [&_.item]:mr-5'}>
        <InfoItem value={statusText} />
      </div>
      <div className={'text-center flex-1 w-1/3 [&_.item]:my-0 mx-2.5'}>
        <ZoomControl />
      </div>
      <div className={'flex w-1/3 items-center justify-end gap-5 text-right'}>
        <InfoItem
          value={
            <>
              <span className={fps === null ? 'text-muted-foreground' : undefined}>
                {fps ?? '—'}
              </span>{' '}
              FPS
            </>
          }
        />
        <InfoItem value={APP_VERSION} />
      </div>
    </div>
  );
}

interface InfoItemProps {
  value?: ReactNode;
}

function InfoItem({ value }: InfoItemProps) {
  return <span className={'inline-block leading-7'}>{value}</span>;
}
