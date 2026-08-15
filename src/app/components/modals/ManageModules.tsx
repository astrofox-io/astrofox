import { useState } from 'react';
import { reloadModuleLibrary } from '@/app/actions/app';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import type { InstalledModule } from '@/lib/modules';
import {
  fetchModulePackage,
  getInstalledModules,
  installModulePackage,
  uninstallModule,
} from '@/lib/modules';

interface ManageModulesProps {
  onClose?: () => void;
}

export default function ManageModules({ onClose }: ManageModulesProps) {
  const [modules, setModules] = useState<Record<string, InstalledModule>>(() =>
    getInstalledModules(),
  );
  const [busyName, setBusyName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const entries = Object.values(modules).sort((a, b) =>
    a.manifest.label.localeCompare(b.manifest.label),
  );

  async function handleRemove(name: string) {
    setBusyName(name);
    setError(null);
    try {
      uninstallModule(name);
      await reloadModuleLibrary();
      setModules(getInstalledModules());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyName(null);
    }
  }

  async function handleUpdate(installed: InstalledModule) {
    const name = installed.manifest.name;
    setBusyName(name);
    setError(null);
    try {
      const pkg = await fetchModulePackage(installed.sourceUrl);
      if (pkg.manifest.name !== name) {
        throw new Error(`URL now serves a different module (${pkg.manifest.name})`);
      }
      installModulePackage(pkg);
      await reloadModuleLibrary();
      setModules(getInstalledModules());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyName(null);
    }
  }

  return (
    <div className="flex w-[38rem] max-w-full flex-col">
      <div className="flex max-h-[24rem] flex-col gap-2 overflow-y-auto p-4">
        {entries.length === 0 ? (
          <div className="py-6 text-center text-sm text-neutral-400">
            No external modules installed. Use "Add module from URL…" in the layer and effect menus
            to install one.
          </div>
        ) : null}

        {error ? (
          <div className="rounded border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {entries.map(installed => {
          const { manifest } = installed;
          const busy = busyName === manifest.name;
          const origin = (() => {
            try {
              return new URL(installed.sourceUrl).origin;
            } catch {
              return installed.sourceUrl;
            }
          })();

          return (
            <div
              key={manifest.name}
              className="flex items-center gap-3 rounded border border-neutral-700 bg-neutral-900 px-3 py-2.5"
            >
              {manifest.icon && installed.files[manifest.icon] ? (
                // biome-ignore lint/performance/noImgElement: data URL icon from the module store
                <img src={installed.files[manifest.icon]} alt="" className="h-7 w-7 rounded" />
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-100">{manifest.label}</span>
                  <span className="text-neutral-400">v{manifest.version}</span>
                  {installed.dev ? (
                    <span className="rounded bg-amber-900/60 px-1.5 py-0.5 text-xs text-amber-300">
                      dev
                    </span>
                  ) : null}
                </div>
                <div className="truncate text-xs text-neutral-400">
                  {manifest.name} · {manifest.type}/{manifest.runtime} · {origin}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => handleUpdate(installed)}
              >
                {installed.dev ? 'Reload' : 'Update'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => handleRemove(manifest.name)}
              >
                Remove
              </Button>
            </div>
          );
        })}

        {entries.length > 0 ? (
          <div className="pt-1 text-xs text-neutral-500">
            Removing a module stops its layers and effects from rendering in open and saved projects
            until it is installed again.
          </div>
        ) : null}
      </div>
      <div className="shrink-0 bg-neutral-800 px-4 py-3">
        <DialogFooter className="sm:justify-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}
