import { useTranslation } from 'react-i18next';
import useError, { clearError } from '@/app/actions/error';
import Dialog from '@/app/components/window/Dialog';
import { Warning } from '@/app/icons';

interface ErrorDialogProps {
  onClose?: () => void;
}

export default function ErrorDialog({ onClose }: ErrorDialogProps) {
  const { t: tc } = useTranslation(undefined, { keyPrefix: 'common' });
  const message = useError(state => state.message);

  function handleConfirm() {
    clearError();
    onClose?.();
  }

  return (
    <Dialog
      icon={Warning}
      message={message ?? undefined}
      buttons={[tc('ok')]}
      onConfirm={handleConfirm}
    />
  );
}
