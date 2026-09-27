import type React from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useAudioStore from '@/app/actions/audio';
import { seekTransport } from '@/app/actions/timeline';
import { player } from '@/app/global';
import { snapToFrame } from '@/lib/timeline/clip';
import { formatTime } from '@/lib/utils/format';
import { LABEL_WIDTH, RULER_HEIGHT } from './constants';

interface TimelineRulerProps {
  pixelsPerSecond: number;
  trackWidth: number;
  duration: number;
  fps: number;
  snap: boolean;
}

const TICK_STEPS = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
const MIN_MAJOR_SPACING = 72;

function chooseTickStep(pixelsPerSecond: number) {
  return TICK_STEPS.find(step => step * pixelsPerSecond >= MIN_MAJOR_SPACING) ?? 600;
}

function formatTick(time: number, step: number) {
  return step < 1 ? time.toFixed(step < 0.25 ? 1 : 2).replace(/\.?0+$/, '') : formatTime(time);
}

/** Peak amplitude per pixel column, so the waveform matches the current zoom. */
function computePeaks(buffer: AudioBuffer, width: number, pixelsPerSecond: number) {
  const peaks = new Float32Array(width);
  const samplesPerPixel = buffer.sampleRate / pixelsPerSecond;
  const stride = Math.max(1, Math.floor(samplesPerPixel / 24));

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);

    for (let x = 0; x < width; x += 1) {
      const start = Math.floor(x * samplesPerPixel);
      const end = Math.min(data.length, Math.floor((x + 1) * samplesPerPixel));
      let max = 0;

      for (let i = start; i < end; i += stride) {
        const value = Math.abs(data[i]);
        if (value > max) max = value;
      }

      if (max > peaks[x]) peaks[x] = max;
    }
  }

  return peaks;
}

export default function TimelineRuler({
  pixelsPerSecond,
  trackWidth,
  duration,
  fps,
  snap,
}: TimelineRulerProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'timeline' });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  // Re-draw when the audio changes; the buffer itself is read from the player.
  const audioDuration = useAudioStore(state => state.duration);
  const audioFile = useAudioStore(state => state.file);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = trackWidth;
    const height = RULER_HEIGHT;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const context = canvas.getContext('2d');
    if (!context) return;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#171717';
    context.fillRect(0, 0, width, height);

    // Waveform along the bottom two thirds.
    const buffer = player.getAudio()?.buffer ?? null;
    const waveTop = 14;
    const waveHeight = height - waveTop - 2;

    if (buffer && audioDuration > 0) {
      const waveWidth = Math.min(width, Math.ceil(buffer.duration * pixelsPerSecond));
      const peaks = computePeaks(buffer, waveWidth, pixelsPerSecond);
      context.fillStyle = '#3f3f46';

      for (let x = 0; x < waveWidth; x += 1) {
        const barHeight = Math.max(1, peaks[x] * waveHeight);
        context.fillRect(x, waveTop + (waveHeight - barHeight) / 2, 1, barHeight);
      }
    }

    // Past the project end.
    const endX = duration * pixelsPerSecond;
    if (endX < width) {
      context.fillStyle = 'rgba(0, 0, 0, 0.35)';
      context.fillRect(endX, 0, width - endX, height);
    }

    // Ticks and labels.
    const step = chooseTickStep(pixelsPerSecond);
    const minor = step / ([15, 30, 60, 120, 300, 600].includes(step) ? 6 : 5);
    context.font = '10px ui-sans-serif, system-ui, sans-serif';
    context.textBaseline = 'top';

    for (let time = 0, i = 0; time <= duration + 1e-9; i += 1, time = i * minor) {
      const x = Math.round(time * pixelsPerSecond) + 0.5;
      const isMajor = Math.abs(time / step - Math.round(time / step)) < 1e-6;

      context.fillStyle = isMajor ? '#a3a3a3' : '#525252';
      context.fillRect(x, isMajor ? 0 : 6, 1, isMajor ? 12 : 4);

      if (isMajor) {
        context.fillStyle = '#a3a3a3';
        context.fillText(formatTick(time, step), x + 3, 1);
      }
    }
  }, [pixelsPerSecond, trackWidth, duration, audioDuration, audioFile]);

  function seekFromEvent(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const time = (event.clientX - rect.left) / pixelsPerSecond;
    seekTransport(snap ? snapToFrame(time, fps) : time);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromEvent(event);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (dragging.current) seekFromEvent(event);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className="sticky top-0 z-20 flex" style={{ height: RULER_HEIGHT }}>
      <div
        className="sticky left-0 z-50 flex shrink-0 items-end border-r border-b border-neutral-800 bg-neutral-900 px-2 pb-1 text-[10px] uppercase text-neutral-500"
        style={{ width: LABEL_WIDTH }}
      >
        {t('title')}
      </div>
      <canvas
        ref={canvasRef}
        aria-label={t('scrub')}
        className="block cursor-text border-b border-neutral-800"
        style={{ width: trackWidth, height: RULER_HEIGHT }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
