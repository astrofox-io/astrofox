import { useState } from 'react';
import { reloadPluginLibrary } from '@/app/actions/app';
import TextInput from '@/components/TextInput';
import { Button } from '@/components/ui/button';
import type { InstalledPlugin, PluginPackage } from '@/lib/plugins';
import {
  fetchPluginPackage,
  getInstalledPlugins,
  installPluginPackage,
  uninstallPlugin,
} from '@/lib/plugins';

interface ManagePluginsProps {
  initialUrl?: string;
}

export default function ManagePlugins({ initialUrl = '' }: ManagePluginsProps) {
  const [plugins, setPlugins] = useState<Record<string, InstalledPlugin>>(() =>
    getInstalledPlugins(),
  );
  const [url, setUrl] = useState(initialUrl);
  const [candidate, setCandidate] = useState<PluginPackage | null>(null);
  const [installBusy, setInstallBusy] = useState(false);
  const [busyName, setBusyName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const entries = Object.values(plugins).sort((a, b) =>
    a.manifest.label.localeCompare(b.manifest.label),
  );
  const existing = candidate ? plugins[candidate.manifest.name] : null;

  async function handleReview() {
    if (!url.trim() || installBusy) {
      return;
    }

    setInstallBusy(true);
    setError(null);
    setCandidate(null);
    try {
      setCandidate(await fetchPluginPackage(url.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setInstallBusy(false);
    }
  }

  async function handleInstall() {
    if (!candidate || installBusy) {
      return;
    }

    setInstallBusy(true);
    setError(null);
    try {
      installPluginPackage(candidate);
      await reloadPluginLibrary();
      setPlugins(getInstalledPlugins());
      setCandidate(null);
      setUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setInstallBusy(false);
    }
  }

  async function handleRemove(name: string) {
    setBusyName(name);
    setError(null);
    try {
      uninstallPlugin(name);
      await reloadPluginLibrary();
      setPlugins(getInstalledPlugins());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyName(null);
    }
  }

  async function handleUpdate(installed: InstalledPlugin) {
    const name = installed.manifest.name;
    setBusyName(name);
    setError(null);
    try {
      const pkg = await fetchPluginPackage(installed.sourceUrl);
      if (pkg.manifest.name !== name) {
        throw new Error(`URL now serves a different plugin (${pkg.manifest.name})`);
      }
      installPluginPackage(pkg);
      await reloadPluginLibrary();
      setPlugins(getInstalledPlugins());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyName(null);
    }
  }

  return (
    <div className="flex w-[42rem] max-w-full flex-col">
      <div className="flex min-h-0 flex-col gap-3 p-4">
        <form
          className="flex gap-2"
          onSubmit={event => {
            event.preventDefault();
            void handleReview();
          }}
        >
          <TextInput
            name="pluginUrl"
            value={url}
            placeholder="Plugin manifest URL"
            width="100%"
            disabled={installBusy}
            className="min-w-0 flex-1 text-neutral-100"
            onChange={(_name, value) => {
              setUrl(value);
              setCandidate(null);
              setError(null);
            }}
          />
          <Button type="submit" variant="default" size="sm" disabled={!url.trim() || installBusy}>
            {installBusy && !candidate ? 'Adding…' : 'Add'}
          </Button>
        </form>

        {candidate ? (
          <div className="flex items-center gap-3 rounded border border-neutral-700 bg-neutral-900 px-3 py-2.5">
            {candidate.manifest.icon && candidate.files[candidate.manifest.icon] ? (
              // biome-ignore lint/performance/noImgElement: data URL icon from the plugin package
              <img
                src={candidate.files[candidate.manifest.icon]}
                alt=""
                className="h-8 w-8 rounded"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="truncate text-neutral-100">{candidate.manifest.label}</span>
                <span className="shrink-0 text-neutral-400">v{candidate.manifest.version}</span>
              </div>
              <div className="truncate text-xs text-neutral-400">
                {candidate.manifest.name}
                {candidate.manifest.author ? ` · ${candidate.manifest.author}` : ''}
              </div>
              {candidate.manifest.permissions.length > 0 ? (
                <div className="truncate text-xs text-amber-400">
                  Permissions: {candidate.manifest.permissions.join(', ')}
                </div>
              ) : null}
              {candidate.manifest.libraries?.length > 0 ? (
                <div className="truncate text-xs text-neutral-400">
                  Libraries: {candidate.manifest.libraries.join(', ')}
                </div>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={installBusy}
              onClick={() => setCandidate(null)}
            >
              Cancel
            </Button>
            <Button variant="default" size="sm" disabled={installBusy} onClick={handleInstall}>
              {installBusy ? 'Installing…' : existing ? 'Update' : 'Install'}
            </Button>
          </div>
        ) : null}

        {error ? (
          <div className="rounded border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <div className="flex max-h-[20rem] min-h-0 flex-col gap-2 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="py-5 text-center text-sm text-neutral-500">No plugins installed.</div>
          ) : null}

          {entries.map(installed => {
            const { manifest } = installed;
            const busy = busyName === manifest.name;

            return (
              <div
                key={manifest.name}
                className="flex items-center gap-3 rounded border border-neutral-700 bg-neutral-900 px-3 py-2.5"
              >
                {manifest.icon && installed.files[manifest.icon] ? (
                  // biome-ignore lint/performance/noImgElement: data URL icon from the plugin store
                  <img src={installed.files[manifest.icon]} alt="" className="h-7 w-7 rounded" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="truncate text-neutral-100">{manifest.label}</span>
                    <span className="shrink-0 text-neutral-400">v{manifest.version}</span>
                    {installed.dev ? (
                      <span className="rounded bg-amber-900/60 px-1.5 py-0.5 text-xs text-amber-300">
                        dev
                      </span>
                    ) : null}
                  </div>
                  <div className="truncate text-xs text-neutral-500">{manifest.name}</div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy || installBusy}
                  onClick={() => handleUpdate(installed)}
                >
                  {installed.dev ? 'Reload' : 'Update'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy || installBusy}
                  onClick={() => handleRemove(manifest.name)}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
