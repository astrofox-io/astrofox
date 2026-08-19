import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { setActiveReactorId } from '@/app/actions/app';
import { loadScenes } from '@/app/actions/scenes';
import { PRIMARY_COLOR } from '@/app/constants';
import { events, reactors } from '@/app/global';
import { Times } from '@/app/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CanvasMeter from '@/lib/canvas/CanvasMeter';
import type Display from '@/lib/core/Display';

interface ReactorInputProps {
  display: Display;
  name: string;
  value: unknown;
  /** Internal canvas resolution; the meter stretches to fill the row via CSS. */
  width?: number;
  height?: number;
  color?: string;
}

export default function ReactorInput({
  display,
  name,
  value,
  width = 200,
  height = 12,
  color = PRIMARY_COLOR,
}: ReactorInputProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'inputs' });
  const canvas = useRef<HTMLCanvasElement>(null);
  const meter = useRef<CanvasMeter | null>(null);
  const lastValue = useRef(value);
  const reactor = useMemo(() => reactors.getElementById(display.getReactor(name)!.id), [display]);

  function disableReactor() {
    display.removeReactor(name);
    display.update({ [name]: lastValue.current });

    setActiveReactorId(null);

    loadScenes();
  }

  function toggleReactor() {
    setActiveReactorId((reactor as { id: string })?.id ?? null);
  }

  function draw() {
    const { output } = (reactor as { getResult: () => { output: number } }).getResult();

    meter.current?.render(output);
  }

  useEffect(() => {
    meter.current = new CanvasMeter(
      {
        width,
        height,
        color,
      },
      canvas.current!,
    );

    events.on('render', draw);

    return () => {
      events.off('render', draw);
    };
  }, []);

  return (
    <div className="flex min-w-0 flex-1 flex-row items-center gap-1">
      <Button
        type="button"
        variant="outline"
        className="h-8 min-w-0 flex-1 rounded-md border-border bg-neutral-900 px-2 py-0 shadow-none hover:bg-neutral-900 focus-visible:border-ring focus-visible:ring-0"
        onDoubleClick={toggleReactor}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleReactor();
          }
        }}
      >
        <canvas ref={canvas} className="canvas w-full" width={width} height={height} />
      </Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="shrink-0 text-neutral-300 hover:bg-transparent hover:text-neutral-100"
                onClick={disableReactor}
              >
                <Times className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent
            side="bottom"
            sideOffset={6}
            className="z-100 rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg"
          >
            {t('disable-reactor')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
