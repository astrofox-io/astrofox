import { setActiveReactorId } from "@/app/actions/app";
import { loadScenes } from "@/app/actions/scenes";
import { PRIMARY_COLOR } from "@/app/constants";
import { events, reactors } from "@/app/global";
import { Times } from "@/app/icons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import CanvasMeter from "@/lib/canvas/CanvasMeter";
import type Display from "@/lib/core/Display";
import React, { useRef, useEffect, useMemo } from "react";

interface ReactorInputProps {
	display: Display;
	name: string;
	value: unknown;
	width?: number;
	height?: number;
	color?: string;
}

export default function ReactorInput({
	display,
	name,
	value,
	width = 100,
	height = 10,
	color = PRIMARY_COLOR,
}: ReactorInputProps) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const meter = useRef<CanvasMeter | null>(null);
	const lastValue = useRef(value);
	const reactor = useMemo(
		() => reactors.getElementById(display.getReactor(name)!.id),
		[display],
	);

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
		const { output } = (
			reactor as { getResult: () => { output: number } }
		).getResult();

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

		events.on("render", draw);

		return () => {
			events.off("render", draw);
		};
	}, []);

	return (
		<div className={"flex flex-row items-center gap-1"}>
			<div
				className={
					"flex h-8 shrink-0 items-center rounded border border-border-input bg-neutral-900 py-0 px-2"
				}
				onDoubleClick={toggleReactor}
			>
				<canvas ref={canvas} className="canvas" width={width} height={height} />
			</div>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger
						render={
							<Times
								className={
									"ml-1 mr-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center self-center leading-none text-neutral-300 [&:hover]:text-neutral-100"
								}
								onClick={disableReactor}
							/>
						}
					/>
					<TooltipContent
						side="bottom"
						sideOffset={6}
						className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
					>
						Disable reactor
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}
