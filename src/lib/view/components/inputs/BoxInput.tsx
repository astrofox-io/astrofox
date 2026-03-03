import { clamp } from "@/lib/utils/math";
import useMouseDrag from "@/lib/view/hooks/useMouseDrag";
import type React from "react";
import { useRef } from "react";

interface BoxValue {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface DragStartValues {
	position: string;
	startX: number;
	startY: number;
	startWidth: number;
	startHeight: number;
	startLeft: number;
	startTop: number;
}

interface BoxInputProps {
	name?: string;
	value: BoxValue;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	onChange?: (name: string, value: BoxValue) => void;
}

export default function BoxInput({
	name = "box",
	value,
	minWidth = 1,
	minHeight = 1,
	maxWidth = 100,
	maxHeight = 100,
	onChange,
}: BoxInputProps) {
	const startDrag = useMouseDrag();
	const { x, y, width, height } = value;
	const startValues = useRef<DragStartValues | null>(null);

	function handleDrag(e: MouseEvent) {
		const {
			startWidth,
			startHeight,
			startX,
			startY,
			position,
			startTop,
			startLeft,
		} = startValues.current!;
		const deltaX = e.pageX - startX;
		const deltaY = e.pageY - startY;
		const value: BoxValue = { x, y, width, height };

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

		onChange?.(name, value);
	}

	const handleDragStart = (position: string) => (e: React.MouseEvent) => {
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
			className={"absolute top-0 left-0 border border-primary"}
			style={{
				width,
				height,
				top: y,
				left: x,
			}}
		>
			<div
				className={"absolute cursor-move w-full h-full"}
				onMouseDown={handleDragStart("center")}
			/>
			<div
				className={"absolute cursor-ns-resize w-full h-2.5 -top-1"}
				onMouseDown={handleDragStart("top")}
			/>
			<div
				className={"absolute cursor-ew-resize w-2.5 h-full -right-1"}
				onMouseDown={handleDragStart("right")}
			/>
			<div
				className={"absolute cursor-ns-resize w-full h-2.5 -bottom-1"}
				onMouseDown={handleDragStart("bottom")}
			/>
			<div
				className={"absolute cursor-ew-resize w-2.5 h-full -left-1"}
				onMouseDown={handleDragStart("left")}
			/>
		</div>
	);
}
