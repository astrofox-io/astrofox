import { clamp } from "@/lib/utils/math";
import Icon from "@/lib/view/components/interface/Icon";
import useMouseDrag from "@/lib/view/hooks/useMouseDrag";
import { DotsHorizontal } from "@/lib/view/icons";
import classNames from "classnames";
import type React from "react";
import { useRef } from "react";

interface SplitterStartValues {
	startWidth: number | null;
	startHeight: number | null;
	startX: number;
	startY: number;
}

interface SplitterProps {
	type?: "horizontal" | "vertical";
	width?: number | null;
	height?: number | null;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	onResize?: (width: number | null, height: number | null) => void;
}

export default function Splitter({
	type = "horizontal",
	width,
	height,
	minWidth,
	minHeight,
	maxWidth,
	maxHeight,
	onResize,
}: SplitterProps) {
	const startDrag = useMouseDrag();
	const startValues = useRef<SplitterStartValues | null>(null);

	function handleDrag(e: MouseEvent) {
		const { startWidth, startHeight, startX, startY } = startValues.current!;
		const deltaX = e.pageX - startX;
		const deltaY = e.pageY - startY;
		let newWidth = width ?? null;
		let newHeight = height ?? null;

		switch (type) {
			case "horizontal":
				newHeight = clamp(
					(startHeight ?? 0) + deltaY,
					minHeight ?? 0,
					maxHeight ?? Number.POSITIVE_INFINITY,
				);
				break;

			case "vertical":
				newWidth = clamp(
					(startWidth ?? 0) + deltaX,
					minWidth ?? 0,
					maxWidth ?? Number.POSITIVE_INFINITY,
				);
				break;
		}

		onResize?.(newWidth, newHeight);
	}

	function handleDragStart(e: React.MouseEvent) {
		startValues.current = {
			startWidth: width ?? null,
			startHeight: height ?? null,
			startX: e.pageX,
			startY: e.pageY,
		};
		startDrag(e, { onDrag: handleDrag });
	}

	return (
		<div
			className={classNames("bg-neutral-900 text-center relative", {
				"w-1 h-full cursor-ew-resize": type === "vertical",
				"h-1 w-full cursor-ns-resize": type !== "vertical",
			})}
			onMouseDown={handleDragStart}
		>
			<Icon
				className={classNames("text-neutral-300 w-4 h-4", {
					"block absolute my-0 mx-auto -top-1 left-0 right-0":
						type === "horizontal",
				})}
				glyph={DotsHorizontal}
			/>
		</div>
	);
}
