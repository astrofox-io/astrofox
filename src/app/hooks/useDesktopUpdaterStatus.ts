import { useEffect, useState } from 'react';
import {
  type DesktopUpdaterStatus,
  getDesktopUpdaterStatus,
  isDesktopUpdaterAvailable,
  onDesktopUpdaterStatus,
} from '@/app/desktop';

export default function useDesktopUpdaterStatus() {
  const [updaterAvailable, setUpdaterAvailable] = useState(false);
  const [status, setStatus] = useState<DesktopUpdaterStatus | null>(null);

  useEffect(() => {
    if (!isDesktopUpdaterAvailable()) {
      return;
    }

    let mounted = true;
    let receivedEvent = false;
    setUpdaterAvailable(true);

    const unsubscribe = onDesktopUpdaterStatus(nextStatus => {
      receivedEvent = true;
      setStatus(nextStatus);
    });

    void getDesktopUpdaterStatus().then(nextStatus => {
      if (mounted && !receivedEvent) {
        setStatus(nextStatus);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { updaterAvailable, status, setStatus };
}
