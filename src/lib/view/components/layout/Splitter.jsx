import { clamp } from "@/lib/utils/math";
import Icon from "@/lib/view/components/interface/Icon";
import useMouseDrag from "@/lib/view/hooks/useMouseDrag";
import { DotsHorizontal } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useRef } from "react";

export default function Splitter({
	type = "horizontal",
	width,
	height,
	minWidth,
	minHeight,
	maxWidth,
	maxHeight,
	onResize,
}) {
	const startDrag = useMouseDrag();
	const startValues = useRef();

	function handleDrag(e) {
		const { startWidth, startHeight, startX, startY } = startValues.current;
		const deltaX = e.pageX - startX;
		const deltaY = e.pageY - startY;
		let newWidth = width;
		let newHeight = height;

		switch (type) {
			case "horizontal":
				newHeight = clamp(startHeight + deltaY, minHeight, maxHeight);
				break;

			case "vertical":
				newWidth = clamp(startWidth + deltaX, minWidth, maxWidth);
				break;
		}

		onResize(newWidth, newHeight);
	}

	function handleDragStart(e) {
		startValues.current = {
			startWidth: width,
			startHeight: height,
			startX: e.pageX,
			startY: e.pageY,
		};
		startDrag(e, { onDrag: handleDrag });
	}

	return (
		<div
			className={classNames("bg-gray75 text-center relative", {
				"w-[5px] h-full cursor-ew-resize": type === "vertical",
				"h-[5px] w-full cursor-ns-resize": type !== "vertical",
			})}
			onMouseDown={handleDragStart}
		>
			<Icon
				className={classNames("text-text200 w-3 h-3", {
					"block absolute my-0 mx-auto -top-1 left-0 right-0":
						type === "horizontal",
				})}
				glyph={DotsHorizontal}
			/>
		</div>
	);
}
