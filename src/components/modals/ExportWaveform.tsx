import { useEffect, useMemo, useRef } from 'react';
import CanvasAudio from '@/lib/canvas/CanvasAudio';

const canvasProperties = {
  width: 854,
  height: 70,
  shadowHeight: 18,
  barWidth: 3,
  barSpacing: 1,
  bgColor: '#333333',
  bars: 213,
};

interface ExportWaveformProps {
  audioBuffer: AudioBuffer | null;
  startTime: number;
  endTime: number;
  duration: number;
}

function createWaveCanvas(colors: { color: [string, string]; shadowColor: string }) {
  return new CanvasAudio(
    {
      ...canvasProperties,
      ...colors,
    },
    new OffscreenCanvas(canvasProperties.width, canvasProperties.height),
  );
}

export default function ExportWaveform({
  audioBuffer,
  startTime,
  endTime,
  duration,
}: ExportWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseCanvas, selectionCanvas] = useMemo(
    () => [
      createWaveCanvas({
        color: ['#555555', '#444444'],
        shadowColor: '#333333',
      }),
      createWaveCanvas({
        color: ['#B6AAFF', '#927FFF'],
        shadowColor: '#554B96',
      }),
    ],
    [],
  );

  useEffect(() => {
    if (!audioBuffer) {
      return;
    }

    baseCanvas.render(audioBuffer);
    selectionCanvas.render(audioBuffer);
  }, [audioBuffer, baseCanvas, selectionCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const { width, height } = canvas;
    const startPosition = duration > 0 ? (startTime / duration) * width : 0;
    const endPosition = duration > 0 ? (endTime / duration) * width : 0;
    const selectionWidth = Math.max(0, endPosition - startPosition);

    context.clearRect(0, 0, width, height);
    context.drawImage(baseCanvas.getCanvas(), 0, 0, width, height);

    if (selectionWidth > 0) {
      context.drawImage(
        selectionCanvas.getCanvas(),
        startPosition,
        0,
        selectionWidth,
        height,
        startPosition,
        0,
        selectionWidth,
        height,
      );
    }

    context.fillStyle = 'rgba(182, 170, 255, 0.18)';
    context.fillRect(startPosition, 0, selectionWidth, canvasProperties.height);
  }, [baseCanvas, duration, endTime, selectionCanvas, startTime]);

  return (
    <div className="overflow-hidden rounded border border-neutral-700 bg-neutral-900 px-3 py-3 shadow-[inset_0_0_24px_rgba(0,0,0,0.35)]">
      <canvas
        ref={canvasRef}
        className="block h-[88px] w-full"
        width={canvasProperties.width}
        height={canvasProperties.height + canvasProperties.shadowHeight}
      />
    </div>
  );
}
