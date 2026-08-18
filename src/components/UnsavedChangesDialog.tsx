import { useTranslation } from 'react-i18next';
import useProject, { newProject, openProjectFile, saveProject } from '@/app/actions/project';
import Dialog from '@/components/Dialog';

interface UnsavedChangesDialogProps {
  action?: string;
  onClose?: () => void;
}

export default function UnsavedChangesDialog({ action, onClose }: UnsavedChangesDialogProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'unsaved-changes' });
  const { t: tc } = useTranslation(undefined, { keyPrefix: 'common' });
  const project = useProject(state => state);

  async function handleAction(actionType: string) {
    if (actionType === 'new-project') {
      await newProject();
    } else if (actionType === 'open-project') {
      await openProjectFile();
    }
  }

  async function closeThenRunAction() {
    onClose?.();
    await Promise.resolve();
    if (action) {
      await handleAction(action);
    }
  }

  async function handleConfirm(button: string) {
    if (button === tc('yes')) {
      const saved = await saveProject(project.projectName);

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
