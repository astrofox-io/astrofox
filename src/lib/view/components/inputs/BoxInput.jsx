import { clamp } from "@/lib/utils/math.js";
import useMouseDrag from "@/lib/view/hooks/useMouseDrag";
import React, { useRef } from "react";

export default function BoxInput({
	name = "box",
	value,
	minWidth = 1,
	minHeight = 1,
	maxWidth = 100,
	maxHeight = 100,
	onChange,
}) {
	const startDrag = useMouseDrag();
	const { x, y, width, height } = value;
	const startValues = useRef();

	function handleDrag(e) {
		const {
			startWidth,
			startHeight,
			startX,
			startY,
			position,
			startTop,
			startLeft,
		} = startValues.current;
		const deltaX = e.pageX - startX;
		const deltaY = e.pageY - startY;
		const value = { x, y, width, height };

		switch (position) {
			case "top":
				value.y = clamp(
					startTop + deltaY,
					0,
					startTop + startHeight - minHeight,
				);
				value.height = clamp(
					startHeight - deltaY,
					minHeight,
					startTop + startHeight,
				);
				break;
			case "right":
				value.width = clamp(
					startWidth + deltaX,
					minWidth,
					maxWidth - startLeft,
				);
				break;
			case "bottom":
				value.height = clamp(
					startHeight + deltaY,
					minHeight,
					maxHeight - startTop,
				);
				break;
			case "left":
				value.x = clamp(
					startLeft + deltaX,
					0,
					startLeft + startWidth - minWidth,
				);
				value.width = clamp(
					startWidth - deltaX,
					minWidth,
					startLeft + startWidth,
				);
				break;
			case "center":
				value.x = clamp(startLeft + deltaX, 0, maxWidth - startWidth);
				value.y = clamp(startTop + deltaY, 0, maxHeight - startHeight);
				break;
		}

		onChange(name, value);
	}

	const handleDragStart = (position) => (e) => {
		startValues.current = {
			position,
			startX: e.pageX,
			startY: e.pageY,
			startWidth: width,
			startHeight: height,
			startLeft: x,
			startTop: y,
		};
		startDrag(e, {
			onDrag: handleDrag,
		});
	};

	return (
		<div
			className={"absolute top-0 left-0 border border-[var(--primary400)]"}
			style={{
				width,
				height,
				top: y,
				left: x,
			}}
		>
			<div className={"absolute cursor-move w-full h-full"} onMouseDown={handleDragStart("center")} />
			<div className={"absolute cursor-ns-resize w-full h-[10px] top-[-5px]"} onMouseDown={handleDragStart("top")} />
			<div className={"absolute cursor-ew-resize w-[10px] h-full right-[-5px]"} onMouseDown={handleDragStart("right")} />
			<div className={"absolute cursor-ns-resize w-full h-[10px] bottom-[-5px]"} onMouseDown={handleDragStart("bottom")} />
			<div className={"absolute cursor-ew-resize w-[10px] h-full left-[-5px]"} onMouseDown={handleDragStart("left")} />
		</div>
	);
}
