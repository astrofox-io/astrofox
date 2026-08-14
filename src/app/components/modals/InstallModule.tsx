import { useState } from 'react';
import { reloadModuleLibrary } from '@/app/actions/app';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import type { ModulePackage } from '@/lib/modules';
import { fetchModulePackage, getInstalledModule, installModulePackage } from '@/lib/modules';

interface InstallModuleProps {
  initialUrl?: string;
  onClose?: () => void;
}

export default function InstallModule({ initialUrl = '', onClose }: InstallModuleProps) {
  const [url, setUrl] = useState(initialUrl);
  const [pkg, setPkg] = useState<ModulePackage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    if (!url.trim() || busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      setPkg(await fetchModulePackage(url.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPkg(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleInstall() {
    if (!pkg || busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      installModulePackage(pkg);
      await reloadModuleLibrary();
      onClose?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const existing = pkg ? getInstalledModule(pkg.manifest.name) : null;
  const origin = pkg ? new URL(pkg.sourceUrl).origin : null;

  return (
    <div className="flex w-[32rem] max-w-full flex-col">
      <div className="flex flex-col gap-3 p-4">
        <div className="text-sm text-neutral-300">
          Enter the URL of a module manifest (astrofox.module.json). The module will be reviewed
          before anything is installed.
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            spellCheck={false}
            placeholder="https://example.com/module/astrofox.module.json"
            onChange={e => {
              setUrl(e.target.value);
              setPkg(null);
              setError(null);
            }}
            onKeyDown={e => e.key === 'Enter' && handleFetch()}
            className="h-8 flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
          />
          <Button variant="default" size="sm" disabled={busy || !url.trim()} onClick={handleFetch}>
            {busy && !pkg ? 'Fetching…' : 'Fetch'}
          </Button>
        </div>

        {error ? (
          <div className="rounded border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {pkg ? (
          <div className="flex flex-col gap-1.5 rounded border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm">
            <div className="flex items-center gap-2">
              {pkg.manifest.icon && pkg.files[pkg.manifest.icon] ? (
                // biome-ignore lint/performance/noImgElement: data URL icon from the module package
                <img src={pkg.files[pkg.manifest.icon]} alt="" className="h-6 w-6 rounded" />
              ) : null}
              <span className="text-base text-neutral-100">{pkg.manifest.label}</span>
              <span className="text-neutral-400">v{pkg.manifest.version}</span>
            </div>
            <div className="text-neutral-400">
              {pkg.manifest.name}
              {pkg.manifest.author ? ` — by ${pkg.manifest.author}` : ''}
            </div>
            {pkg.manifest.description ? (
              <div className="text-neutral-300">{pkg.manifest.description}</div>
            ) : null}
            <div className="text-neutral-400">
              {pkg.manifest.type === 'effect' ? 'Effect' : 'Display'} ·{' '}
              {pkg.manifest.runtime === 'shader'
                ? 'shader (no code execution)'
                : 'sandboxed worker code'}{' '}
              · from {origin}
            </div>
            {pkg.manifest.permissions.length > 0 ? (
              <div className="text-amber-400">
                Requests permissions: {pkg.manifest.permissions.join(', ')}
              </div>
            ) : null}
            {existing ? (
              <div className="text-amber-400">
                Replaces installed version {existing.manifest.version}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="shrink-0 bg-neutral-800 px-4 py-3">
        <DialogFooter className="sm:justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" size="sm" disabled={!pkg || busy} onClick={handleInstall}>
            {busy && pkg ? 'Installing…' : existing ? 'Update' : 'Install'}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}
