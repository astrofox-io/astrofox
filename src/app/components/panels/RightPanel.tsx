import { useTranslation } from 'react-i18next';
import ControlsPanel from '@/app/components/panels/ControlsPanel';
import PanelHeader from '@/app/components/panels/PanelHeader';

export default function RightPanel() {
  const { t } = useTranslation(undefined, { keyPrefix: 'panels' });

  return (
    <div className="flex flex-col w-90 shrink-0 overflow-hidden border-l">
      <PanelHeader title={t('controls')} />
      <ControlsPanel />
    </div>
  );
}
