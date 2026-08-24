import { Minus, PanelBottom, PanelLeft, PanelRight, Square, X } from 'lucide-react';
import Image from 'next/image';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAppStore, {
  handleMenuAction,
  toggleBottomPanelVisibility,
  toggleLeftPanelVisibility,
  toggleRightPanelVisibility,
} from '@/app/actions/app';
import useProject, { DEFAULT_PROJECT_NAME } from '@/app/actions/project';
import { closeWindow, getWindowState, maximizeWindow, minimizeWindow } from '@/app/api-client';
import { isDesktopApp, isMacDesktop } from '@/app/desktop';
import { env } from '@/app/global';
import TitleBarUpdateButton from '@/components/TitleBarUpdateButton';
import { Button } from '@/components/ui/button';

export default function TitleBar() {
  const { t } = useTranslation(undefined, { keyPrefix: 'title-bar' });
  const isLeftPanelVisible = useAppStore(state => state.isLeftPanelVisible);
  const isBottomPanelVisible = useAppStore(state => state.isBottomPanelVisible);
  const isRightPanelVisible = useAppStore(state => state.isRightPanelVisible);
  const projectName = useProject(state => state.projectName);
  const title =
    projectName && projectName !== DEFAULT_PROJECT_NAME ? projectName : t('default-project-name');
  const desktop = isDesktopApp();
  const macDesktop = isMacDesktop();
  // hiddenInset traffic lights occupy the leading edge; keep custom chrome after them.
  const macTrafficLightInset = macDesktop ? 'pl-[76px]' : '';
  const [maximized, setMaximized] = useState(false);
  const projectTitleRef = useRef<HTMLButtonElement>(null);
  const allowProjectTitleFocusRef = useRef(false);

  useEffect(() => {
    const allowKeyboardFocus = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        allowProjectTitleFocusRef.current = true;
      }
    };

    window.addEventListener('keydown', allowKeyboardFocus, true);

    return () => {
      window.removeEventListener('keydown', allowKeyboardFocus, true);
    };
  }, []);

  useEffect(() => {
    if (!desktop) return;

    let unsubscribe: (() => void) | undefined;
    const bridge = window.__ASTROFOX__;

    getWindowState()
      .then(state => {
        if (state && typeof state.maximized === 'boolean') {
          setMaximized(state.maximized);
        }
      })
      .catch(() => {});

    if (bridge?.onWindowStateChanged) {
      unsubscribe = bridge.onWindowStateChanged(state => {
        if (typeof state?.maximized === 'boolean') {
          setMaximized(state.maximized);
        }
        if (state?.focused) {
          window.requestAnimationFrame(() => {
            const projectTitle = projectTitleRef.current;
            if (projectTitle && document.activeElement === projectTitle) {
              projectTitle.blur();
            }
          });
        }
      });
    }

    return () => {
      unsubscribe?.();
    };
  }, [desktop]);

  const panelButtons = [
    {
      key: 'left',
      label: isLeftPanelVisible ? t('hide-layers-panel') : t('show-layers-panel'),
      isVisible: isLeftPanelVisible,
      icon: PanelLeft,
      onClick: toggleLeftPanelVisibility,
    },
    {
      key: 'bottom',
      label: isBottomPanelVisible ? t('hide-player-panel') : t('show-player-panel'),
      isVisible: isBottomPanelVisible,
      icon: PanelBottom,
      onClick: toggleBottomPanelVisibility,
    },
    {
      key: 'right',
      label: isRightPanelVisible ? t('hide-controls-panel') : t('show-controls-panel'),
      isVisible: isRightPanelVisible,
      icon: PanelRight,
      onClick: toggleRightPanelVisibility,
    },
  ];

  return (
    <div
      className={`flex items-center relative h-12 bg-neutral-900 border-b ${macTrafficLightInset}`}
      style={desktop ? ({ WebkitAppRegion: 'drag' } as CSSProperties) : undefined}
    >
      <div
        className={'flex items-center gap-1.5 ml-3 max-w-[45vw]'}
        style={desktop ? ({ WebkitAppRegion: 'no-drag' } as CSSProperties) : undefined}
      >
        <Image
          alt=""
          aria-hidden="true"
          className="block h-8 w-8 shrink-0 opacity-90"
          draggable={false}
          height={32}
          src="/icon.svg"
          width={32}
        />
        <Button
          ref={projectTitleRef}
          variant="ghost"
          size="sm"
          className="bg-transparent text-neutral-400 truncate max-w-[32vw] hover:text-neutral-100 hover:bg-neutral-800"
          onPointerDown={() => {
            allowProjectTitleFocusRef.current = true;
          }}
          onFocus={event => {
            const allowFocus = allowProjectTitleFocusRef.current;
            allowProjectTitleFocusRef.current = false;
            if (!allowFocus) {
              event.currentTarget.blur();
            }
          }}
          onClick={() => handleMenuAction('edit-canvas')}
        >
          {title}
        </Button>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 text-sm leading-12 tracking-widest uppercase cursor-default max-[700px]:hidden text-neutral-400">
        {env.APP_NAME}
      </div>
      <div
        className="absolute inset-y-0 right-0 flex items-center"
        style={desktop ? ({ WebkitAppRegion: 'no-drag' } as CSSProperties) : undefined}
      >
        <TitleBarUpdateButton />
        <div className={`flex items-center gap-1 ${desktop && !macDesktop ? 'mr-6' : 'mr-2'}`}>
          {panelButtons.map(button => {
            const Icon = button.icon;

            return (
              <Button
                key={button.key}
                variant="ghost"
                size="icon-sm"
                className={`${
                  button.isVisible
                    ? 'bg-transparent text-neutral-400'
                    : 'bg-transparent text-neutral-500'
                } hover:bg-neutral-800 hover:text-neutral-100`}
                aria-label={button.label}
                aria-pressed={button.isVisible}
                onClick={button.onClick}
              >
                <Icon size={16} />
              </Button>
            );
          })}
        </div>
        {desktop && !macDesktop ? (
          <div className="flex h-full items-stretch">
            <Button
              variant="ghost"
              className="h-full w-11 rounded-none bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
              aria-label={t('minimize-window')}
              onClick={() => {
                void minimizeWindow();
              }}
            >
              <Minus size={16} />
            </Button>
            <Button
              variant="ghost"
              className="h-full w-11 rounded-none bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
              aria-label={maximized ? t('restore-window') : t('maximize-window')}
              onClick={() => {
                void maximizeWindow().then(state => {
                  if (state && typeof state.maximized === 'boolean') {
                    setMaximized(state.maximized);
                  }
                });
              }}
            >
              <Square size={14} />
            </Button>
            <Button
              variant="ghost"
              className="h-full w-11 rounded-none bg-transparent text-neutral-400 hover:bg-red-600 hover:text-white"
              aria-label={t('close-window')}
              onClick={() => {
                void closeWindow();
              }}
            >
              <X size={16} />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
