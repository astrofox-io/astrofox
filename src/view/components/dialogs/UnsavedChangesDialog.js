import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from 'components/window/Dialog';
import { newProject, openProject, saveProject } from 'actions/project';

export default function UnsavedChangesDialog({ action, onClose }) {
  const dispatch = useDispatch();
  const project = useSelector(state => state.project);

  async function handleAction(action) {
    if (action === 'new-project') {
      dispatch(newProject());
    } else if (action === 'open-project') {
      dispatch(openProject());
    }
  }

  async function handleConfirm(button) {
    if (button === 'Yes') {
      await dispatch(saveProject(project.file));
      await handleAction(action);
    } else if (button === 'No') {
      await handleAction(action);
    }
    onClose();
  }

  return (
    <Dialog
      message="Do you want to save project changes before closing?"
      buttons={['Yes', 'No', 'Cancel']}
      onConfirm={handleConfirm}
    />
  );
}
