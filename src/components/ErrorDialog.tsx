import { useTranslation } from 'react-i18next';
import useError, { clearError } from '@/app/actions/error';
import { Warning } from '@/app/icons';
import Dialog from '@/components/Dialog';

interface ErrorDialogProps {
  onClose?: () => void;
}

export default function ErrorDialog({ onClose }: ErrorDialogProps) {
  const { t: tc } = useTranslation(undefined, { keyPrefix: 'common' });
  const message = useError(state => state.message);
  const error = useError(state => state.error);

  function handleConfirm() {
    clearError();
    onClose?.();
  }

  return (
    <Dialog
      icon={Warning}
      message={message ?? undefined}
      detail={error ?? undefined}
      buttons={[tc('ok')]}
      onConfirm={handleConfirm}
    />
  );
}
