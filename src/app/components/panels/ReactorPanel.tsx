import useApp, { setActiveReactorId } from "@/app/actions/app";
import { Control } from "@/app/components/controls";
import { BoxInput } from "@/app/components/inputs";
import {
  PRIMARY_COLOR,
  REACTOR_BARS,
  REACTOR_BAR_HEIGHT,
  REACTOR_BAR_SPACING,
  REACTOR_BAR_WIDTH,
} from "@/app/constants";
import { events, reactors } from "@/app/global";
import useEntity from "@/app/hooks/useEntity";
import { Times } from "@/app/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CanvasBars from "@/lib/canvas/CanvasBars";
import CanvasMeter from "@/lib/canvas/CanvasMeter";
import { inputValueToProps } from "@/lib/utils/react";
import React, { useEffect, useRef } from "react";

const SPECTRUM_WIDTH = REACTOR_BARS * (REACTOR_BAR_WIDTH + REACTOR_BAR_SPACING);
const METER_WIDTH = 20;

export default function ReactorPanel() {
  const activeReactorId = useApp((state) => state.activeReactorId);
  const reactor = activeReactorId
    ? reactors.getElementById(activeReactorId)
    : undefined;

  if (!reactor) {
    return null;
  }

  return <ReactorControl reactor={reactor} />;
}

interface ReactorControlProps {
  reactor: {
    displayName: string;
    properties: Record<string, unknown>;
    getResult: () => { fft: Float32Array | number[]; output: number };
    [key: string]: unknown;
  };
}

const ReactorControl = ({ reactor }: ReactorControlProps) => {
  const spectrum = useRef<CanvasBars | null>(null);
  const meter = useRef<CanvasMeter | null>(null);
  const spectrumCanvas = useRef<HTMLCanvasElement>(null);
  const outputCanvas = useRef<HTMLCanvasElement>(null);
  const onChange = useEntity(
    reactor as unknown as Parameters<typeof useEntity>[0],
  );

  function handleChange(props: Record<string, unknown>) {
    onChange(props);
  }

  function hideReactor() {
    setActiveReactorId(null);
  }

  function draw() {
    const { fft, output } = reactor.getResult();

    spectrum.current?.render(fft);
    meter.current?.render(output);
  }

  useEffect(() => {
    spectrum.current = new CanvasBars(
      {
        width: SPECTRUM_WIDTH,
        height: REACTOR_BAR_HEIGHT,
        barWidth: REACTOR_BAR_WIDTH,
        barSpacing: REACTOR_BAR_SPACING,
        shadowHeight: 0,
        color: "#775FD8",
        backgroundColor: "#FF0000",
      },
      spectrumCanvas.current!,
    );

    meter.current = new CanvasMeter(
      {
        width: METER_WIDTH,
        height: REACTOR_BAR_HEIGHT,
        color: PRIMARY_COLOR,
        origin: "bottom",
      },
      outputCanvas.current!,
    );

    events.on("render", draw);

    return () => {
      events.off("render", draw);
      spectrum.current = null;
      meter.current = null;
    };
  }, [reactor]);

  return (
    <div
      className={
        "w-full overflow-hidden bg-neutral-900 border-t relative py-4 px-5"
      }
    >
      <div
        className={
          "text-neutral-300 text-sm [text-shadow:1px_1px_0_var(--color-neutral-900)] uppercase"
        }
      >
        {reactor.displayName}
      </div>
      <div className={"flex flex-row justify-center items-center"}>
        <div className={"min-w-72 mt-2.5 mr-2.5 mb-0 ml-0"}>
          <Control
            display={
              reactor as unknown as Parameters<typeof Control>[0]["display"]
            }
            showHeader={false}
          />
        </div>
        <div
          className={
            "relative bg-neutral-900 shadow-[inset_0_0_60px_rgba(0,_0,_0,_0.5)] border  border-neutral-800"
          }
        >
          <canvas
            ref={spectrumCanvas}
            width={SPECTRUM_WIDTH}
            height={REACTOR_BAR_HEIGHT}
          />
          <BoxInput
            name="selection"
            value={
              reactor.properties.selection as {
                x: number;
                y: number;
                width: number;
                height: number;
              }
            }
            minWidth={REACTOR_BAR_WIDTH}
            minHeight={REACTOR_BAR_WIDTH}
            maxWidth={SPECTRUM_WIDTH}
            maxHeight={REACTOR_BAR_HEIGHT}
            onChange={inputValueToProps(handleChange)}
          />
        </div>
        <div
          className={
            "ml-2.5 shadow-[inset_0_0_20px_rgba(0,_0,_0,_0.5)] border border-neutral-800"
          }
        >
          <canvas
            ref={outputCanvas}
            width={METER_WIDTH}
            height={REACTOR_BAR_HEIGHT}
          />
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <div
                className="absolute top-2 right-2 z-10 text-neutral-100 bg-neutral-900 min-h-6 min-w-6 text-center rounded inline-flex justify-center items-center cursor-default shrink-0 [&:hover]:bg-neutral-800"
                onClick={hideReactor}
              />
            }
          >
            <Times className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={6}
            className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
          >
            Close panel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
