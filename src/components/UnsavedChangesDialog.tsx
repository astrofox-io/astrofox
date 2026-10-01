import { useTranslation } from 'react-i18next';
import { saveProject } from '@/app/actions/project';
import Dialog from '@/components/Dialog';

interface UnsavedChangesDialogProps {
  /** What the person was doing when asked: runs once they save or discard. */
  onContinue?: () => unknown;
  onClose?: () => void;
}

export default function UnsavedChangesDialog({ onContinue, onClose }: UnsavedChangesDialogProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'unsaved-changes' });
  const { t: tc } = useTranslation(undefined, { keyPrefix: 'common' });

  async function closeThenRunAction() {
    onClose?.();
    await Promise.resolve();
    await onContinue?.();
  }

  async function handleConfirm(button: string) {
    if (button === tc('yes')) {
      const saved = await saveProject();

      if (saved) {
        await closeThenRunAction();
      }
    } else if (button === tc('no')) {
      await closeThenRunAction();
    } else {
      onClose?.();
    }
  }

  return (
    <Dialog
      message={t('message')}
      buttons={[tc('yes'), tc('no'), tc('cancel')]}
      onConfirm={handleConfirm}
    />
  );
}
