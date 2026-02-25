import CanvasBars from "@/lib/canvas/CanvasBars";
import CanvasMeter from "@/lib/canvas/CanvasMeter";
import { inputValueToProps } from "@/lib/utils/react";
import useApp, { setActiveReactorId } from "@/lib/view/actions/app";
import { Control } from "@/lib/view/components/controls";
import { BoxInput } from "@/lib/view/components/inputs";
import Icon from "@/lib/view/components/interface/Icon";
import {
	PRIMARY_COLOR,
	REACTOR_BARS,
	REACTOR_BAR_HEIGHT,
	REACTOR_BAR_SPACING,
	REACTOR_BAR_WIDTH,
} from "@/lib/view/constants";
import { events, reactors } from "@/lib/view/global";
import useEntity from "@/lib/view/hooks/useEntity";
import { ChevronDown } from "@/lib/view/icons";
import React, { useEffect, useRef } from "react";

const SPECTRUM_WIDTH = REACTOR_BARS * (REACTOR_BAR_WIDTH + REACTOR_BAR_SPACING);
const METER_WIDTH = 20;

export default function ReactorPanel() {
	const activeReactorId = useApp((state) => state.activeReactorId);
	const reactor = reactors.getElementById(activeReactorId);

	if (!reactor) {
		return null;
	}

	return <ReactorControl reactor={reactor} />;
}

const ReactorControl = ({ reactor }: any) => {
	const spectrum = useRef<any>(null);
	const meter = useRef<any>(null);
	const spectrumCanvas = useRef<any>(null);
	const outputCanvas = useRef<any>(null);
	const onChange = useEntity(reactor);

	function handleChange(props) {
		onChange(props);
	}

	function hideReactor() {
		setActiveReactorId(null);
	}

	function draw() {
		const { fft, output } = reactor.getResult();

		spectrum.current.render(fft);
		meter.current.render(output);
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
			spectrumCanvas.current,
		);

		meter.current = new CanvasMeter(
			{
				width: METER_WIDTH,
				height: REACTOR_BAR_HEIGHT,
				color: PRIMARY_COLOR,
				origin: "bottom",
			},
			outputCanvas.current,
		);

		events.on("render", draw);

		return () => {
			events.off("render", draw);
			spectrum.current = null;
			meter.current = null;
		};
	}, [reactor]);

	return (
		<div className={"w-full min-w-[56rem] overflow-hidden bg-gray75 border-t border-t-gray200 relative pt-2.5 px-5 pb-4"}>
			<Header path={reactor.displayName.split("/")} />
			<div className={"flex flex-row justify-center items-center"}>
				<div className={"min-w-72 mt-2.5 mr-2.5 mb-0 ml-0"}>
					<Control display={reactor} showHeader={false} />
				</div>
				<div className={"relative bg-gray75 shadow-[inset_0_0_60px_rgba(0,_0,_0,_0.5)] border border-gray200"}>
					<canvas
						ref={spectrumCanvas}
						width={SPECTRUM_WIDTH}
						height={REACTOR_BAR_HEIGHT}
					/>
					<BoxInput
						name="selection"
						value={reactor.properties.selection}
						minWidth={REACTOR_BAR_WIDTH}
						minHeight={REACTOR_BAR_WIDTH}
						maxWidth={SPECTRUM_WIDTH}
						maxHeight={REACTOR_BAR_HEIGHT}
						onChange={inputValueToProps(handleChange)}
					/>
				</div>
				<div className={"ml-2.5 shadow-[inset_0_0_20px_rgba(0,_0,_0,_0.5)] border border-gray200"}>
					<canvas
						ref={outputCanvas}
						width={METER_WIDTH}
						height={REACTOR_BAR_HEIGHT}
					/>
				</div>
			</div>
			<Icon
				className={"absolute top-2.5 right-5 text-text200 w-3.5 h-3.5 [&:hover]:text-text100"}
				glyph={ChevronDown}
				title="Hide Panel"
				onClick={hideReactor}
			/>
		</div>
	);
};

const Header = ({ path }: any) => (
	<div className={"text-text200 text-sm [text-shadow:1px_1px_0_var(--gray75)]"}>
		{path.map((item, index) => (
			<span
				key={index}
				className={"uppercase cursor-default after:content-['\\2022'] after:text-primary100 after:mx-2 last:after:content-none"}
			>
				{item}
			</span>
		))}
	</div>
);
