import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type DesktopMcpStatus, getDesktopBridge } from '@/app/desktop';
import Setting from '@/components/Setting';
import Settings from '@/components/Settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

function CopyIconButton({
  value,
  label,
  disabled,
  onError,
}: {
  value: string;
  label: string;
  disabled?: boolean;
  onError: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setCopied(false);
    return () => clearTimeout(timer.current);
  }, [value]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      clearTimeout(timer.current);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      onError();
    }
  }

  return (
    <Button
      size="icon"
      variant="secondary"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => void copy()}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </Button>
  );
}

export default function McpSettings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'settings.mcp' });
  const [status, setStatus] = useState<DesktopMcpStatus | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const bridge = getDesktopBridge()?.automation;

  useEffect(() => {
    let disposed = false;
    if (!bridge?.getStatus) {
      setError(t('unavailable'));
      setBusy(false);
      return;
    }
    void bridge.getStatus().then(
      next => {
        if (!disposed) {
          setStatus(next);
          setBusy(false);
        }
      },
      cause => {
        if (!disposed) {
          setError(String(cause.message || cause));
          setBusy(false);
        }
      },
    );
    return () => {
      disposed = true;
    };
  }, [bridge, t]);

  async function change(action: () => Promise<DesktopMcpStatus>) {
    setBusy(true);
    setError(null);
    try {
      setStatus(await action());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Settings label={t('title')} columns={['50%', '50%']}>
      <Setting label={t('enable')}>
        <div className="flex flex-wrap items-center gap-3">
          <Switch
            aria-label={t('enable')}
            checked={status?.enabled ?? false}
            disabled={busy || !status || !bridge}
            onCheckedChange={enabled => {
              if (bridge) void change(() => bridge.setEnabled(Boolean(enabled)));
            }}
          />
          <Badge role="status" variant={!busy && status?.running ? 'success' : 'secondary'}>
            {busy ? t('updating') : status?.running ? t('running') : t('stopped')}
          </Badge>
          {status?.enabled && !status.running && bridge && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => void change(() => bridge.setEnabled(true))}
            >
              {t('retry')}
            </Button>
          )}
        </div>
      </Setting>
      {status && (
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="mcp-url">{t('url')}</Label>
            <div className="mt-1 flex gap-2">
              <Input id="mcp-url" readOnly value={status.url} className="font-mono text-xs" />
              <CopyIconButton
                value={status.url}
                label={t('copy-url')}
                onError={() => setError(t('copy-failed'))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="mcp-token">{t('token')}</Label>
            <div className="mt-1 flex gap-2">
              <Input
                id="mcp-token"
                type={revealed ? 'text' : 'password'}
                autoComplete="off"
                spellCheck={false}
                readOnly
                value={status.token}
                className="font-mono text-xs"
              />
              <CopyIconButton
                value={status.token}
                label={t('copy-token')}
                disabled={busy}
                onError={() => setError(t('copy-failed'))}
              />
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                aria-controls="mcp-token"
                aria-pressed={revealed}
                onClick={() => setRevealed(value => !value)}
              >
                {revealed ? t('hide-token') : t('show-token')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={busy || !bridge}
                onClick={() => {
                  if (bridge) void change(() => bridge.resetToken());
                }}
              >
                {t('reset-token')}
              </Button>
            </div>
          </div>
        </div>
      )}
      {(error || status?.error) && (
        <p role="alert" className="mt-3 break-words text-xs text-red-400">
          {error || status?.error}
        </p>
      )}
    </Settings>
  );
}
