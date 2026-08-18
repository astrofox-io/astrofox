import { clsx as classNames } from 'cnfast';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import useAudioStore, { setLiveModeEnabled } from '@/app/actions/audio';
import { PRIMARY_COLOR } from '@/app/constants';
import { analyzer, events } from '@/app/global';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import WaveParser from '@/lib/audio/WaveParser';
import CanvasWave from '@/lib/canvas/CanvasWave';
import type { RenderFrameData } from '@/lib/types';

export const LIVE_SCOPE_WIDTH = 854;

const scopeProperties = {
  width: LIVE_SCOPE_WIDTH,
  height: 86,
  midpoint: 43,
  lineWidth: 2,
  strokeColor: PRIMARY_COLOR,
  fillColor: PRIMARY_COLOR,
  stroke: true,
  fill: false,
  taper: false,
};
const SCOPE_GAIN = 8;

function getPoints(values: Float32Array, width: number, gain: number) {
  const step = width / Math.max(1, values.length - 1);
  const points = new Float32Array(values.length * 2);

  for (let index = 0; index < values.length; index += 1) {
    const amplified = 0.5 + (values[index] - 0.5) * gain;

    points[index * 2] = index * step;
    points[index * 2 + 1] = Math.max(0, Math.min(1, amplified));
  }

  return points;
}

export default function LiveOscilloscope() {
  const { t } = useTranslation(undefined, { keyPrefix: 'player' });
  const { liveModeEnabled, mode } = useAudioStore(
    useShallow(state => ({
      liveModeEnabled: state.liveModeEnabled,
      mode: state.mode,
    })),
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<CanvasWave | null>(null);
  const parserRef = useRef<WaveParser | null>(null);
  const visible =
    liveModeEnabled && (mode === 'microphone' || mode === 'desktop' || mode === 'midi');
  const { width, height } = scopeProperties;

  const flatline = useMemo(() => new Float32Array(width).fill(0.5), [width]);

  useEffect(() => {
    if (!visible || !canvasRef.current) {
      return undefined;
    }

    if (!waveRef.current) {
      waveRef.current = new CanvasWave(scopeProperties, canvasRef.current);
    }

    if (!parserRef.current) {
      parserRef.current = new WaveParser({ smoothingTimeConstant: 0.18 });
    }

    const draw = (frameData?: RenderFrameData) => {
      if (!waveRef.current || !parserRef.current) {
        return;
      }

      if (mode === 'microphone' || mode === 'desktop') {
        analyzer.analyzer.getFloatTimeDomainData(analyzer.td);
      }

      const td = mode === 'microphone' || mode === 'desktop' ? analyzer.td : frameData?.td;
      const sampleSize = Math.max(96, Math.floor(width / 3));
      const values = td
        ? parserRef.current.parseTimeData(td, sampleSize)
        : flatline.subarray(0, sampleSize);
      const peak = values.reduce((max, value) => Math.max(max, Math.abs(value - 0.5) * 2), 0);

      if (levelRef.current) {
        levelRef.current.style.transform = `scaleX(${Math.min(1, peak * SCOPE_GAIN)})`;
      }

      waveRef.current.render(getPoints(values, width, SCOPE_GAIN), true);
    };

    draw();
    const handleRender = (frameData?: unknown) => {
      draw(frameData as RenderFrameData | undefined);
    };
    events.on('render', handleRender);

    return () => {
      events.off('render', handleRender);
    };
  }, [flatline, mode, visible, width]);

  return (
    <div
      aria-hidden={!visible}
      className={classNames(
        'min-w-[56rem] relative overflow-hidden bg-neutral-900 transition-[max-height,transform,opacity,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        {
          'max-h-64 translate-y-0 opacity-100 border-t border-t-neutral-800': visible,
          'pointer-events-none max-h-0 translate-y-4 opacity-0 border-t border-t-transparent':
            !visible,
        },
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="absolute top-2 right-2 z-10 inline-flex min-h-6 min-w-6 shrink-0 items-center justify-center rounded bg-neutral-900 text-neutral-100 cursor-default [&:hover]:bg-neutral-800"
                onClick={() => setLiveModeEnabled(false)}
              />
            }
          >
            <X className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={6}
            className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
          >
            {t('close-input-mode')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div
        className="relative mx-auto mt-4 overflow-hidden border border-neutral-800 bg-neutral-900 shadow-[inset_0_0_70px_rgba(0,_0,_0,_0.72)]"
        style={{ width, height }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(182,170,255,0.045)_0%,rgba(0,0,0,0)_48%,rgba(0,0,0,0.42)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-neutral-800/70" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-neutral-950">
          <div
            ref={levelRef}
            className="h-full origin-left bg-primary transition-transform duration-75"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
        <canvas ref={canvasRef} className="relative block" width={width} height={height} />
      </div>
      <div className="h-4" />
    </div>
  );
}
