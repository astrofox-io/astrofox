import CanvasMeter from "@/lib/canvas/CanvasMeter";
import { setActiveReactorId } from "@/lib/view/actions/app";
import { removeReactor } from "@/lib/view/actions/reactors";
import { loadScenes } from "@/lib/view/actions/scenes";
import Icon from "@/lib/view/components/interface/Icon";
import { PRIMARY_COLOR } from "@/lib/view/constants";
import { events, reactors } from "@/lib/view/global";
import { Times } from "@/lib/view/icons";
import React, { useRef, useEffect, useMemo } from "react";
import styles from "./ReactorInput.module.tailwind";

export default function ReactorInput({
	display,
	name,
	value,
	width = 100,
	height = 10,
	color = PRIMARY_COLOR,
}) {
	const canvas = useRef();
	const meter = useRef();
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
		<div className={styles.reactor}>
			<div className={styles.meter} onDoubleClick={toggleReactor}>
				<canvas ref={canvas} className="canvas" width={width} height={height} />
			</div>
			<Icon
				className={styles.closeIcon}
				glyph={Times}
				title="Disable Reactor"
				onClick={disableReactor}
			/>
		</div>
	);
}
