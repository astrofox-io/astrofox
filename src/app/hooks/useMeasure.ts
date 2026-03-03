import { useCallback, useLayoutEffect, useState } from "react";

interface Dimensions {
	width?: number;
	height?: number;
	top?: number;
	left?: number;
	right?: number;
	bottom?: number;
	x?: number;
	y?: number;
}

export default function useMeasure() {
	const [dimensions, setDimensions] = useState<Dimensions>({});
	const [node, setNode] = useState<HTMLElement | null>(null);

	const ref = useCallback((node: HTMLElement | null) => setNode(node), []);

	const measure = useCallback(() => {
		window.requestAnimationFrame(() => {
			if (node) {
				setDimensions(node.getBoundingClientRect().toJSON());
			}
		});
	}, [node]);

	useLayoutEffect(() => {
		if (node) {
			measure();

			window.addEventListener("resize", measure);
			window.addEventListener("scroll", measure);

			return () => {
				window.removeEventListener("resize", measure);
				window.removeEventListener("scroll", measure);
			};
		}
	}, [node]);

	return [ref, dimensions, measure] as const;
}
