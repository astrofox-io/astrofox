import { useEffect, useState } from 'react';
import { platform, type UpdaterStatus } from '@/lib/platform';

/** The auto-updater's status, when this build has one (packaged desktop builds). */
export default function useDesktopUpdaterStatus() {
  const { updater } = platform;
  const [status, setStatus] = useState<UpdaterStatus | null>(null);

  useEffect(() => {
    if (!updater) {
      return;
    }

    let mounted = true;
    let receivedEvent = false;

    const unsubscribe = updater.onStatus(nextStatus => {
      receivedEvent = true;
      setStatus(nextStatus);
    });

    void updater.getStatus().then(nextStatus => {
      if (mounted && !receivedEvent) {
        setStatus(nextStatus);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [updater]);

  return { updaterAvailable: updater !== null, status, setStatus };
}
