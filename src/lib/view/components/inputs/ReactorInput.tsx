import CanvasMeter from "@/lib/canvas/CanvasMeter";
import { setActiveReactorId } from "@/lib/view/actions/app";
import { removeReactor } from "@/lib/view/actions/reactors";
import { loadScenes } from "@/lib/view/actions/scenes";
import Icon from "@/lib/view/components/interface/Icon";
import { PRIMARY_COLOR } from "@/lib/view/constants";
import { events, reactors } from "@/lib/view/global";
import { Times } from "@/lib/view/icons";
import React, { useRef, useEffect, useMemo } from "react";

export default function ReactorInput({
	display,
	name,
	value,
	width = 100,
	height = 10,
	color = PRIMARY_COLOR,
}: any) {
	const canvas = useRef<any>(null);
	const meter = useRef<any>(null);
	const lastValue = useRef(value);
	const reactor = useMemo(
		() => reactors.getElementById(display.getReactor(name).id),
		[display],
	);

	function disableReactor() {
		display.removeReactor(name);
		display.update({ [name]: lastValue.current });

		setActiveReactorId(null);
		removeReactor(reactor);

		loadScenes();
	}

	function toggleReactor() {
		setActiveReactorId(reactor?.id ?? null);
	}

	function draw() {
		const { output } = reactor.getResult();

		meter.current.render(output);
	}

	useEffect(() => {
		meter.current = new CanvasMeter(
			{
				width,
				height,
				color,
			},
			canvas.current,
		);

		events.on("render", draw);

		return () => {
			events.off("render", draw);
		};
	}, []);

	return (
		<div className={"flex flex-row items-center gap-1"}>
			<div className={"flex h-6 shrink-0 items-center rounded-sm border border-input-border bg-input-bg py-0 px-2"} onDoubleClick={toggleReactor}>
				<canvas ref={canvas} className="canvas" width={width} height={height} />
			</div>
			<Icon
				className={"ml-1 mr-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center self-center leading-none text-text200 [&:hover]:text-text100"}
				glyph={Times}
				title="Disable Reactor"
				onClick={disableReactor}
			/>
		</div>
	);
}
