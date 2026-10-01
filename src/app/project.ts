import stageStore, { setZoom } from '@/app/actions/stage';
import { projectDocument } from '@/app/document';
import { env, library, logger } from '@/app/global';
import { projectMedia } from '@/app/projectMedia';
import { createProject, type Project, type ProjectLibrary } from '@/lib/project/project';
import { seekTransport } from '@/lib/timeline/transport';

let instance: Project | undefined;

// Created on first use, like `projectDocument`, which it subscribes to.
function get() {
  instance ??= createProject({
    document: projectDocument,
    library: () =>
      ({
        displays: library.get('displays') ?? {},
        effects: library.get('effects') ?? {},
      }) as ProjectLibrary,
    media: projectMedia,
    zoom: { get: () => stageStore.getState().zoom, set: setZoom },
    rewind: () => seekTransport(0),
    appVersion: env.APP_VERSION,
  });

  return instance;
}

/**
 * The open project as a file. The menus, dialogs and MCP automation all create,
 * open and save through it; its content is `projectDocument`.
 */
export const project: Project = {
  create: () => get().create(),
  async open(file, options) {
    const result = await get().open(file, options);
    logger.log('Opened project:', file.name);

    for (const name of [...result.removed, ...result.missingPlugins.map(plugin => plugin.name)]) {
      logger.warn('Component not found:', name);
    }

    return result;
  },
  save: (write, options) => get().save(write, options),
  isModified: () => get().isModified(),
  toFile: () => get().toFile(),
};
