import { easeInQuad } from "@/lib/utils/easing";
import React from "react";
import { animated, useTransition } from "react-spring";

interface OverlayProps {
	show?: boolean;
	duration?: number;
	opacity?: number;
	easing?: (t: number) => number;
}

export default function Overlay({
	show,
	duration = 300,
	opacity = 0.5,
	easing = easeInQuad,
}: OverlayProps) {
	const transitions = useTransition(show, {
		from: { opacity: 0 },
		enter: { opacity },
		leave: { opacity: 0 },
		config: { duration, easing },
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const AnimatedDiv = animated.div as React.ComponentType<Record<string, unknown>>;

	return transitions(
		(style, item) =>
			item && (
				<AnimatedDiv
					className={"fixed inset-0 bg-black opacity-50 z-[2]"}
					style={style}
				/>
			),
	);
}
