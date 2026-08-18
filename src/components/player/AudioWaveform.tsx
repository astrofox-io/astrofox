import { clsx as classNames } from 'cnfast';
import type React from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import useAppStore from '@/app/actions/app';
import useAudioStore from '@/app/actions/audio';
import { player } from '@/app/global';
import useSharedState from '@/app/hooks/useSharedState';
import CanvasAudio from '@/lib/canvas/CanvasAudio';

const canvasProperties = {
  width: 854,
  height: 70,
  shadowHeight: 30,
  barWidth: 3,
  barSpacing: 1,
  bgColor: '#333333',
  bars: 213,
};

export default function AudioWaveform() {
  const { t } = useTranslation(undefined, { keyPrefix: 'player' });
  const isVideoRecording = useAppStore(state => state.isVideoRecording);
  const { liveModeEnabled, mode } = useAudioStore(
    useShallow(state => ({
      liveModeEnabled: state.liveModeEnabled,
      mode: state.mode,
    })),
  );
  const videoExportSegment = useAppStore(state => state.videoExportSegment);
  const videoExportPosition = useAppStore(state => state.videoExportPosition);
  const [state, setState] = useSharedState();
  const { progressPosition, seekPosition } = state as {
    progressPosition?: number;
    seekPosition?: number;
  };
  const { width, height, shadowHeight } = canvasProperties;
  const canvas = useRef<HTMLCanvasElement>(null);
  const hasAudioRef = useRef(false);
  const flatRenderedRef = useRef(false);
  const hasAudio = !liveModeEnabled && mode === 'file' && player.canSeek();

  const [baseCanvas, progressCanvas, seekCanvas] = useMemo(
    () => [
      new CanvasAudio(
        {
          ...canvasProperties,
          color: ['#555555', '#444444'],
          shadowColor: '#333333',
        },
        new OffscreenCanvas(width, height),
      ),
      new CanvasAudio(
        {
          ...canvasProperties,
          color: ['#B6AAFF', '#927FFF'],
          shadowColor: '#554B96',
        },
        new OffscreenCanvas(width, height),
      ),
      new CanvasAudio(
        {
          ...canvasProperties,
          color: ['#8880BF', '#6C5FBF'],
          shadowColor: '#403972',
        },
        new OffscreenCanvas(width, height),
      ),
    ],
    [],
  );

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isVideoRecording || !hasAudio) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const progressPosition = (e.clientX - rect.left) / rect.width;

    player.seek(progressPosition);

    setState({ progressPosition, seekPosition: 0 });
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isVideoRecording || !hasAudio) {
      return;
    }

    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const seekPosition = (e.clientX - rect.left) / rect.width;

    setState({ seekPosition });
  }

  function handleMouseOut() {
    setState({ seekPosition: 0 });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLCanvasElement>) {
    if (isVideoRecording || !hasAudio) {
      return;
    }

    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }

    e.preventDefault();

    const nextPosition = seekPosition ?? progressPosition ?? 0;

    player.seek(nextPosition);
    setState({ progressPosition: nextPosition, seekPosition: 0 });
  }

  function drawWaveform() {
    if (!canvas.current) return;

    const { width, height } = canvas.current;
    const context = canvas.current.getContext('2d');
    if (!context) return;
    const position =
      (isVideoRecording && videoExportPosition != null
        ? videoExportPosition
        : (progressPosition ?? 0)) * width;
    const seek = isVideoRecording ? 0 : (seekPosition ?? 0) * width;
    const sx = seek < position ? seek : position;
    const dx = seek < position ? position - seek : seek - position;
    const selectionStart = videoExportSegment ? videoExportSegment.startPosition * width : 0;
    const selectionEnd = videoExportSegment ? videoExportSegment.endPosition * width : 0;
    const selectionWidth = Math.max(0, selectionEnd - selectionStart);

    context.clearRect(0, 0, width, height);
    context.drawImage(baseCanvas.getCanvas(), 0, 0, width, height);

    if (videoExportSegment && selectionWidth > 0) {
      context.drawImage(
        seekCanvas.getCanvas(),
        selectionStart,
        0,
        selectionWidth,
        height,
        selectionStart,
        0,
        selectionWidth,
        height,
      );

      context.fillStyle = 'rgba(108, 95, 191, 0.18)';
      context.fillRect(selectionStart, 0, selectionWidth, height);
    }

    if (videoExportSegment) {
      const playedStart = selectionStart;
      const playedEnd = Math.min(position, selectionEnd);
      const playedWidth = Math.max(0, playedEnd - playedStart);

      if (playedWidth > 0) {
        context.drawImage(
          progressCanvas.getCanvas(),
          playedStart,
          0,
          playedWidth,
          height,
          playedStart,
          0,
          playedWidth,
          height,
        );
      }
    } else if (position > 0) {
      context.drawImage(progressCanvas.getCanvas(), 0, 0, position, height, 0, 0, position, height);
    }

    if (!videoExportSegment && seek > 0) {
      context.drawImage(seekCanvas.getCanvas(), sx, 0, dx, height, sx, 0, dx, height);
    }
  }

  function renderFlatWaveform() {
    const { bars } = canvasProperties;
    const flatData = new Float32Array(bars).fill(0.05);
    baseCanvas.bars.render(flatData);
    progressCanvas.bars.render(flatData);
    seekCanvas.bars.render(flatData);
    flatRenderedRef.current = true;
  }

  function loadAudio() {
    const audio = player.getAudio();
    if (!audio?.buffer) return;

    baseCanvas.render(audio.buffer);
    progressCanvas.render(audio.buffer);
    seekCanvas.render(audio.buffer);
    hasAudioRef.current = true;
    flatRenderedRef.current = false;
  }

  useEffect(() => {
    player.on('audio-load', loadAudio);

    return () => {
      player.off('audio-load', loadAudio);
    };
  }, []);

  useEffect(() => {
    if (!hasAudio) {
      hasAudioRef.current = false;
      return;
    }

    loadAudio();
  }, [hasAudio]);

  useLayoutEffect(() => {
    if (hasAudio) {
      if (!hasAudioRef.current && !flatRenderedRef.current) {
        renderFlatWaveform();
      }
      drawWaveform();
    }
  });

  return (
    <div
      aria-hidden={!hasAudio}
      className={classNames(
        'min-w-[56rem] relative overflow-hidden bg-neutral-900 shadow-[inset_0_0_40px_rgba(0,_0,_0,_0.5)] transition-[max-height,transform,opacity,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        {
          'max-h-64 translate-y-0 opacity-100 border-t border-t-neutral-800': hasAudio,
          'pointer-events-none max-h-0 translate-y-4 opacity-0 border-t border-t-transparent':
            !hasAudio,
        },
      )}
    >
      <div className="relative mx-auto mt-5" style={{ width, height: height + shadowHeight }}>
        {/* biome-ignore lint/a11y/useSemanticElements: The interactive waveform must remain a canvas rendering surface. */}
        <canvas
          ref={canvas}
          className={classNames('block', {
            'cursor-pointer': hasAudio && !isVideoRecording,
            'cursor-default': !hasAudio || isVideoRecording,
          })}
          tabIndex={hasAudio && !isVideoRecording ? 0 : -1}
          role="button"
          aria-disabled={!hasAudio || isVideoRecording}
          aria-label={t('audio-waveform-seek-bar')}
          width={width}
          height={height + shadowHeight}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseMove={handleMouseMove}
          onMouseOut={handleMouseOut}
          onBlur={handleMouseOut}
        />
      </div>
      <div className="h-5" />
    </div>
  );
}
