// @ts-nocheck
import { easeInQuad } from "@/lib/utils/easing";
import React from "react";
import { animated, useTransition } from "react-spring";

export default function Overlay({
	show,
	duration = 300,
	opacity = 0.5,
	easing = easeInQuad,
}: any) {
	const transitions = useTransition(show, {
		from: { opacity: 0 },
		enter: { opacity },
		leave: { opacity: 0 },
		config: { duration, easing },
	});

	return transitions(
		(style, item) =>
			item && (
				<animated.div
					className={"fixed inset-0 bg-black opacity-50 z-[var(--z-index-overlay)]"}
					style={style}
				/>
			),
	);
}
