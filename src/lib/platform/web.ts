import { t } from '@/i18n/config';
import type {
  Dialogs,
  FileFilter,
  FileHandle,
  OpenDialogOptions,
  OpenDialogResult,
  Platform,
  PlatformEnvironment,
  SaveDialogOptions,
  SaveDialogResult,
  SaveTarget,
} from './types';

interface PickerType {
  description: string;
  accept: Record<string, string[]>;
}

function buildPickerTypes(filters: FileFilter[] = []): PickerType[] | undefined {
  if (!filters.length) return undefined;

  return filters.map(filter => ({
    description: filter.name || t('file-types.files'),
    accept: {
      [filter.mimeType || 'application/octet-stream']: (filter.extensions || []).map(
        ext => `.${ext}`,
      ),
    },
  }));
}

function isWritableHandle(target: SaveTarget): target is FileHandle {
  return Boolean(target && typeof target === 'object' && 'createWritable' in target);
}

async function showOpen(options: OpenDialogOptions = {}): Promise<OpenDialogResult> {
  const multiple = Boolean(options.multiple);
  const types = buildPickerTypes(options.filters);

  if (window.showOpenFilePicker) {
    try {
      const handles = await window.showOpenFilePicker({ types, multiple });
      const files = await Promise.all(handles.map(handle => handle.getFile()));
      return { canceled: false, files, fileHandles: handles as unknown as FileHandle[] };
    } catch (error) {
      if (error && (error as Error).name === 'AbortError') {
        return { canceled: true, files: [] };
      }
      throw error;
    }
  }

  return new Promise<OpenDialogResult>(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    if (options.filters?.length) {
      const extensions = options.filters.flatMap(filter => filter.extensions || []);
      input.accept = extensions.map(ext => `.${ext}`).join(',');
    }
    input.onchange = () => {
      const files = Array.from(input.files || []);
      resolve({ canceled: files.length === 0, files });
    };
    // Cancel is not reliably detectable on all browsers; empty selection ≈ cancel.
    input.addEventListener('cancel', () => {
      resolve({ canceled: true, files: [] });
    });
    input.click();
  });
}

async function showSave(options: SaveDialogOptions = {}): Promise<SaveDialogResult> {
  const suggestedName = options.defaultPath || 'astrofox';
  const types = buildPickerTypes(options.filters);

  if (window.showSaveFilePicker) {
    try {
      const handle = (await window.showSaveFilePicker({
        suggestedName,
        types,
      })) as unknown as FileHandle;
      return { canceled: false, fileHandle: handle, filePath: handle.name };
    } catch (error) {
      if (error && (error as Error).name === 'AbortError') {
        return { canceled: true };
      }
      throw error;
    }
  }

  // No File System Access: the caller downloads with this suggested name.
  return { canceled: false, filePath: suggestedName };
}

/** Write to a File System Access handle, or trigger a browser download. */
async function write(target: SaveTarget, blob: Blob, fallbackName: string) {
  if (isWritableHandle(target)) {
    const writable = await target.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }

  const filename = typeof target === 'string' && target ? target : fallbackName || 'astrofox';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.split(/[\\/]/).pop() || filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Firefox and Safari may not start a download from a detached anchor, and
  // revoking the object URL in the same task can cancel the navigation before
  // the browser has consumed it. Release it after the download has started.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/** The browser's file pickers and downloads. The desktop adapter uses these too. */
export const webDialogs: Dialogs = {
  showOpen,
  showSave,
  canPickSaveLocation: () =>
    typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function',
  write,
};

/** The browser: file pickers and downloads, nothing native. */
export function createWebPlatform(environment: PlatformEnvironment = {}): Platform {
  return {
    isDesktop: false,
    environment: { ...environment, IS_DESKTOP: false },
    dialogs: webDialogs,
    fonts: null,
    window: null,
    files: null,
    encoder: null,
    updater: null,
    automation: null,
  };
}
