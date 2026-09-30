import { t } from '@/i18n/config';
import type { DesktopBridge } from './channels';
import { getFileMimeType } from './fileTypes';
import type {
  Automation,
  Dialogs,
  Encoder,
  FileFilter,
  NativeFiles,
  OpenDialogOptions,
  OpenDialogResult,
  Platform,
  PlatformEnvironment,
  SaveDialogOptions,
  SaveDialogResult,
  Updater,
} from './types';
import { webDialogs } from './web';

function toBytes(data: Uint8Array | ArrayBuffer) {
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}

function isAbsoluteFilePath(value: string) {
  // Windows drive (C:\ or C:/), UNC (\\server), or POSIX (/) paths.
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\') || value.startsWith('/');
}

function nativeFilters(filters: FileFilter[] = []) {
  return filters.map(filter => ({
    name: filter.name || t('file-types.files'),
    extensions: filter.extensions || ['*'],
  }));
}

/** The Electron app, over the IPC channels in `./channels.ts`. */
export function createDesktopPlatform(
  bridge: DesktopBridge,
  baseEnvironment: PlatformEnvironment = {},
): Platform {
  const environment: PlatformEnvironment = {
    ...baseEnvironment,
    ...bridge.environment,
    IS_DESKTOP: true,
  };

  const files: NativeFiles = {
    tempPath: String(environment.TEMP_PATH || ''),
    async read(filePath) {
      const { name, data } = await bridge.invoke('desktop:read-file', { filePath });
      return { name, data: toBytes(data) };
    },
    async write(filePath, data) {
      await bridge.invoke('desktop:write-file', { filePath, data });
    },
    async writeTemp(name, data) {
      const { filePath } = await bridge.invoke('desktop:write-temp-file', { name, data });
      return filePath;
    },
    async removeTemp(filePath) {
      const { ok } = await bridge.invoke('desktop:remove-path', { filePath });
      return ok;
    },
    reveal: filePath => bridge.invoke('desktop:show-item-in-folder', filePath),
  };

  /**
   * Native open: the dialog returns paths; the bytes are loaded over IPC and
   * `.path` is attached for callers that need the real location (ffmpeg).
   */
  async function showNativeOpen(options: OpenDialogOptions): Promise<OpenDialogResult> {
    const result = await bridge.invoke('dialog:show-open', {
      filters: nativeFilters(options.filters),
      multiple: Boolean(options.multiple),
    });

    if (result.canceled || !result.filePaths?.length) {
      return { canceled: true, files: [] };
    }

    const opened = await Promise.all(
      result.filePaths.map(async filePath => {
        const { name, data } = await files.read(filePath);
        const fileName = name || 'file';
        const file = new File([data.slice().buffer], fileName, {
          type: getFileMimeType(fileName, options.filters),
        });
        Object.assign(file, { path: filePath });
        return file;
      }),
    );

    return { canceled: false, files: opened, filePaths: result.filePaths };
  }

  async function showNativeSave(options: SaveDialogOptions): Promise<SaveDialogResult> {
    const result = await bridge.invoke('dialog:show-save', {
      defaultPath: options.defaultPath || 'astrofox',
      filters: nativeFilters(options.filters),
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    return { canceled: false, filePath: result.filePath };
  }

  // The web pickers, plus native ones where a real path is needed.
  const dialogs: Dialogs = {
    showOpen: (options = {}) =>
      options.preferNativePath ? showNativeOpen(options) : webDialogs.showOpen(options),
    showSave: (options = {}) =>
      options.preferNativePath ? showNativeSave(options) : webDialogs.showSave(options),
    canPickSaveLocation: (options = {}) =>
      Boolean(options.preferNativePath) || webDialogs.canPickSaveLocation(options),
    async write(target, blob, fallbackName) {
      // Absolute paths come only from native save dialogs.
      if (typeof target === 'string' && isAbsoluteFilePath(target)) {
        await files.write(target, new Uint8Array(await blob.arrayBuffer()));
        return;
      }

      await webDialogs.write(target, blob, fallbackName);
    },
  };

  const encoder: Encoder | null =
    environment.FFMPEG_AVAILABLE && environment.FFMPEG_PATH
      ? {
          async run(args, id) {
            await bridge.invoke('ffmpeg:run', { args, id });
          },
          async startPipe(args, id) {
            await bridge.invoke('ffmpeg:start-pipe', { args, id });
          },
          async write(id, data) {
            await bridge.invoke('ffmpeg:write', { id, data });
          },
          async endPipe(id) {
            await bridge.invoke('ffmpeg:end-pipe', { id });
          },
          async kill(id) {
            await bridge.invoke('ffmpeg:kill', { id });
          },
        }
      : null;

  // Wired up in packaged builds, plus dev builds running the simulated
  // updater (ASTROFOX_FAKE_UPDATE).
  const updater: Updater | null =
    (environment.UPDATER_ENABLED ?? environment.IS_PACKAGED)
      ? {
          getStatus: () => bridge.invoke('updater:get-status'),
          check: () => bridge.invoke('updater:check'),
          download: () => bridge.invoke('updater:download'),
          install: () => bridge.invoke('updater:install'),
          onStatus: listener => bridge.on('updater:status', listener),
        }
      : null;

  const automation: Automation = {
    getStatus: () => bridge.invoke('mcp:get-status'),
    setEnabled: enabled => bridge.invoke('mcp:set-enabled', enabled),
    resetToken: () => bridge.invoke('mcp:reset-token'),
    onCommand(listener) {
      const probe = () => bridge.send('mcp:ready');
      const stopCommands = bridge.on('mcp:command', listener);
      const stopProbes = bridge.on('mcp:probe', probe);

      probe();

      return () => {
        bridge.send('mcp:not-ready');
        stopCommands();
        stopProbes();
      };
    },
    respond: response => bridge.send('mcp:response', response),
    async readFile(path) {
      const { name, data } = await bridge.invoke('mcp:read-file', path);
      return { name, data: toBytes(data) };
    },
    writeProject: input => bridge.invoke('mcp:write-project', input),
    checkOutput: input => bridge.invoke('mcp:check-output', input),
  };

  return {
    isDesktop: true,
    environment,
    dialogs,
    window: {
      minimize: () => bridge.invoke('window:minimize'),
      toggleMaximize: () => bridge.invoke('window:maximize'),
      close: () => bridge.invoke('window:close'),
      getState: () => bridge.invoke('window:get-state'),
      onStateChange: listener => bridge.on('window-state-changed', listener),
    },
    files,
    encoder,
    updater,
    automation,
  };
}
