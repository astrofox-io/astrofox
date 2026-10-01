import { raiseError } from '@/app/actions/error';
import { showModal } from '@/app/actions/modals';
import { projectDocument } from '@/app/document';
import { api, logger } from '@/app/global';
import { project } from '@/app/project';
import { t } from '@/i18n/config';
import type { MediaRef } from '@/lib/document/types';
import type { OpenResult } from '@/lib/project/project';
import {
  PROJECT_FILE_MIME_TYPE,
  PROJECT_OPEN_EXTENSIONS,
  PROJECT_SAVE_EXTENSIONS,
} from '@/lib/project/projectFile';
import { getFileSystemPath, resolveVideoSourceUrl } from '@/lib/utils/media';

// The menus' and dialogs' side of the Project module (`@/app/project`).

function projectFilters(extensions: string[]) {
  return [
    {
      name: t('file-types.astrofox-project'),
      extensions,
      mimeType: PROJECT_FILE_MIME_TYPE,
    },
  ];
}

function notifyRemovedElements(removed: string[]) {
  if (removed.length === 0) {
    return;
  }

  const unique = [...new Set(removed)];
  const message = t('errors.project-elements-removed', {
    count: unique.length,
    defaultValue:
      'This project was created with an older version of Astrofox. Some elements could not be converted and were removed.',
  });

  raiseError(message, unique.join('\n'), { logLevel: 'warn' });
}

/** Tell the person what an opened project could not bring back. */
function showOpenResult({ removed, missingPlugins, unresolvedMediaRefs }: OpenResult) {
  notifyRemovedElements(removed);

  if (missingPlugins.length > 0) {
    showModal('MissingPlugins', { title: 'Missing Plugins' }, { missing: missingPlugins });
  }

  if (unresolvedMediaRefs.length > 0) {
    openRelinkMediaDialog({
      titleKey: 'relink-media.missing-title',
      titleOptions: { count: unresolvedMediaRefs.length },
    });
  }
}

export function newProject() {
  project.create();
}

/** Run `action` now, or after the person saves or discards unsaved changes. */
export function checkUnsavedChanges(action: () => unknown) {
  if (project.isModified()) {
    showModal('UnsavedChangesDialog', { showCloseButton: false }, { onContinue: action });
  } else {
    action();
  }
}

export async function openProjectFile() {
  try {
    const { files, canceled } = await api.showOpenDialog({
      filters: projectFilters(PROJECT_OPEN_EXTENSIONS),
    });

    if (canceled || !files || !files.length) {
      return false;
    }

    showOpenResult(await project.open(files[0]));
    return true;
  } catch (error) {
    raiseError(t('errors.open-project-file-failed'), error);
    return false;
  }
}

export function openRelinkMediaDialog(modalProps: Record<string, unknown> = {}) {
  showModal('RelinkMediaDialog', {
    titleKey: 'relink-media.title',
    ...modalProps,
  });
}

export async function saveProject() {
  try {
    const fileName = await project.save(async ({ text, fileName, mimeType }) => {
      const { fileHandle, filePath, canceled } = await api.showSaveDialog({
        defaultPath: fileName,
        filters: projectFilters(PROJECT_SAVE_EXTENSIONS),
      });

      if (canceled) {
        return null;
      }

      const target = fileHandle || filePath || fileName;
      const targetName =
        (typeof filePath === 'string' && filePath) ||
        (fileHandle as { name?: string } | undefined)?.name ||
        fileName;

      await api.saveTextFile(target, text, { mimeType, fileName: targetName });
      return targetName;
    });

    if (fileName === null) {
      return false;
    }

    logger.log('Project saved locally:', fileName);
    return true;
  } catch (error) {
    raiseError(t('errors.save-project-file-failed'), error);
    return false;
  }
}

export async function relinkMediaRef(mediaRef: MediaRef) {
  try {
    const isVideo = mediaRef.kind === 'video';
    const filters = isVideo
      ? [{ name: t('file-types.video-files'), extensions: ['mp4', 'webm', 'ogv'] }]
      : [{ name: t('file-types.image-files'), extensions: ['jpg', 'jpeg', 'png', 'gif'] }];
    const { files, canceled } = await api.showOpenDialog({ filters });

    if (canceled || !files || !files.length) {
      return;
    }

    const file = files[0];
    const sourcePath = getFileSystemPath(file);
    const src = isVideo ? resolveVideoSourceUrl(file, sourcePath) : await api.readImageFile(file);

    projectDocument.apply([
      {
        type: 'setProperties',
        id: mediaRef.displayId,
        properties: { src, sourcePath: sourcePath || '' },
      },
      {
        type: 'setUnresolvedMediaRefs',
        refs: projectDocument
          .getState()
          .unresolvedMediaRefs.filter(ref => ref.displayId !== mediaRef.displayId),
      },
    ]);
  } catch (error) {
    raiseError(t('errors.relink-media-failed'), error);
  }
}
