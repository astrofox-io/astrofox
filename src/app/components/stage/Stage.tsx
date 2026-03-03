import { ignoreEvents } from "@/lib/utils/react";
import useAudioStore, { loadAudioFile } from "@/app/actions/audio";
import useStage from "@/app/actions/stage";
import Spinner from "@/app/components/interface/Spinner";
import { analyzer, renderBackend } from "@/app/global";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import shallow from "zustand/shallow";

export default function Stage() {
  const [width, height, backgroundColor, zoom] = useStage(
    (state) => [state.width, state.height, state.backgroundColor, state.zoom],
    shallow,
  );
  const canvas = useRef<HTMLCanvasElement>(null);
  const initProps = useRef({ width, height, backgroundColor });
  const loading = useAudioStore((state) => state.loading);
  const [dropLoading, setDropLoading] = useState(false);

  useEffect(() => {
    const { width, height, backgroundColor } = initProps.current;

    renderBackend.init({
      canvas: canvas.current,
      width,
      height,
      backgroundColor,
    });

    return () => {
      renderBackend.dispose();
    };
  }, []);

  async function handleDrop(e: React.DragEvent) {
    ignoreEvents(e);

    const file = e.dataTransfer.files[0];

    if (file) {
      setDropLoading(true);

      // Force one paint so the overlay spinner can appear immediately.
      await new Promise<void>((resolve) => {
        if (typeof window !== "undefined" && window.requestAnimationFrame) {
          window.requestAnimationFrame(() => resolve());
          return;
        }

        setTimeout(() => resolve(), 0);
      });

      try {
        await loadAudioFile(file, true);
      } finally {
        setDropLoading(false);
      }
    }
  }

  const style = {
    width: `${width * zoom}px`,
    height: `${height * zoom}px`,
  };

  return (
    <div
      className={"flex flex-col flex-1 min-w-0 min-h-0 overflow-auto relative"}
    >
      <div className={"m-auto"}>
        <div
          className={
            "relative flex flex-col justify-center shadow-xl m-5 z-50 bg-black"
          }
          onDrop={handleDrop}
          onDragOver={ignoreEvents}
          onDragEnter={ignoreEvents}
        >
          <canvas
            ref={canvas}
            style={style}
            onDrop={handleDrop}
            onDragOver={ignoreEvents}
            onDragEnter={ignoreEvents}
          />
          <Loading show={loading || dropLoading} />
        </div>
      </div>
    </div>
  );
}

interface LoadingProps {
  show?: boolean;
}

const Loading = ({ show }: LoadingProps) => {
  const [visible, setVisible] = useState(show);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current as unknown as number);
      leaveTimer.current = null;
    }

    if (show) {
      setVisible(true);
      setLeaving(false);
      return undefined;
    }

    if (!visible) {
      return undefined;
    }

    setLeaving(true);
    leaveTimer.current = setTimeout(() => {
      setVisible(false);
      setLeaving(false);
      leaveTimer.current = null;
    }, 220);

    return () => {
      if (leaveTimer.current) {
        window.clearTimeout(leaveTimer.current as unknown as number);
        leaveTimer.current = null;
      }
    };
  }, [show, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={
        "absolute inset-0 z-4 flex items-center justify-center pointer-events-none"
      }
    >
      <div
        className={`${"[animation:stage-loader-pop_220ms_ease-out]"} ${
          leaving ? "[animation:stage-loader-out_220ms_ease-in_forwards]" : ""
        }`}
      >
        <Spinner size={96} />
      </div>
    </div>
  );
};
