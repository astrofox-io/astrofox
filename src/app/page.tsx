'use client';

import dynamic from 'next/dynamic';
import { type CSSProperties, useEffect } from 'react';
import Spinner from '@/components/Spinner';
import I18nProvider from '@/i18n/I18nProvider';

const loadingScreenStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const AstrofoxApp = dynamic(() => import('@/components/App'), {
  ssr: false,
  loading: () => (
    <div style={loadingScreenStyle}>
      <Spinner size={56} />
    </div>
  ),
});

export default function HomePage() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Disable eval in production, matching the previous Vite entrypoint behavior.
      Reflect.deleteProperty(globalThis, 'eval');
      return;
    }

    import('@/app/global').then(globals => {
      window._astrofox = globals;
    });
  }, []);

  return (
    <I18nProvider>
      <AstrofoxApp />
    </I18nProvider>
  );
}
