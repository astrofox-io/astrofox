import CanvasBars from "@/lib/canvas/CanvasBars";
import CanvasMeter from "@/lib/canvas/CanvasMeter";
import { inputValueToProps } from "@/lib/utils/react";
import useApp, { setActiveReactorId } from "@/app/actions/app";
import { Control } from "@/app/components/controls";
import { BoxInput } from "@/app/components/inputs";
import Icon from "@/app/components/interface/Icon";
import Tooltip from "@/app/components/interface/Tooltip";
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
				"w-full min-w-4xl overflow-hidden bg-neutral-900 border-t border-t-neutral-800 relative pt-2.5 px-5 pb-4"
			}
		>
			<Header path={reactor.displayName.split("/")} />
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
						"relative bg-neutral-900 shadow-[inset_0_0_60px_rgba(0,_0,_0,_0.5)] border border-neutral-800"
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
			<Tooltip text="Hide Panel">
				<button
					className="absolute top-2 right-2 z-10 cursor-pointer bg-transparent border-none p-0"
					onClick={hideReactor}
				>
					<Icon
						className="text-neutral-300 w-3.5 h-3.5 [&:hover]:text-neutral-100"
						glyph={Times}
					/>
				</button>
			</Tooltip>
		</div>
	);
};

interface HeaderProps {
	path: string[];
}

const Header = ({ path }: HeaderProps) => (
	<div
		className={
			"text-neutral-300 text-sm [text-shadow:1px_1px_0_var(--color-neutral-900)]"
		}
	>
		{path.map((item: string, index: number) => (
			<span
				key={index}
				className={
					"uppercase cursor-default after:content-['\\2022'] after:text-primary after:mx-2 last:after:content-none"
				}
			>
				{item}
			</span>
		))}
	</div>
);
