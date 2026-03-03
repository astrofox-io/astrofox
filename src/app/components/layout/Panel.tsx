import Splitter from "@/app/components/layout/Splitter";
import classNames from "classnames";
import type React from "react";
import { useState } from "react";

interface PanelProps {
	title?: string;
	direction?: "vertical" | "horizontal";
	stretch?: boolean;
	resizable?: boolean;
	width?: number | null;
	height?: number | null;
	minHeight?: number;
	minWidth?: number;
	maxWidth?: number;
	maxHeight?: number;
	className?: string;
	children?: React.ReactNode;
}

export default function Panel({
	title,
	direction = "vertical",
	stretch = false,
	resizable = false,
	width: initialWidth = null,
	height: initialHeight = null,
	minHeight = 0,
	minWidth = 0,
	maxWidth,
	maxHeight,
	className,
	children,
}: PanelProps) {
	const [state, setState] = useState({
		width: initialWidth as number | null,
		height: initialHeight as number | null,
	});
	const { width, height } = state;

	function handleResize(width: number | null, height: number | null) {
		setState({ width, height });
	}

	return (
		<div
			className={classNames(
				"flex relative bg-neutral-900",
				{
					"flex-col shrink-0": direction === "vertical",
					"flex-row shrink-0": direction !== "vertical",
					"flex-1 min-h-0 min-w-0 overflow-hidden": stretch,
				},
				className,
			)}
			style={{ width: width ?? undefined, height: height ?? undefined }}
		>
			{title && (
				<div className={"flex shrink-0 items-start py-3"}>
					<div
						className={
							"ml-2.5 cursor-default text-sm uppercase text-neutral-300 leading-none"
						}
					>
						{title}
					</div>{" "}
				</div>
			)}
			{children}
			{resizable && (
				<Splitter
					type="horizontal"
					width={width}
					height={height}
					minWidth={minWidth}
					minHeight={minHeight}
					maxWidth={maxWidth}
					maxHeight={maxHeight}
					onResize={handleResize}
				/>
			)}
		</div>
	);
}
