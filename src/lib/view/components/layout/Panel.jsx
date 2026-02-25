import Splitter from "@/lib/view/components/layout/Splitter";
import classNames from "classnames";
import React, { useState } from "react";

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
}) {
	const [state, setState] = useState({
		width: initialWidth,
		height: initialHeight,
	});
	const { width, height } = state;

	function handleResize(width, height) {
		setState({ width, height });
	}

	return (
		<div
			className={classNames(
				"flex relative",
				{
					"flex-col shrink-0": direction === "vertical",
					"flex-row shrink-0": direction !== "vertical",
					"flex-1 min-h-0 min-w-0 overflow-hidden": stretch,
				},
				className,
			)}
			style={{ width, height }}
		>
			{title && (
				<div className={"flex h-[30px] leading-[30px] shrink-0"}>
					<div className={"text-[var(--font-size-small)] text-[var(--text200)] uppercase ml-2.5 cursor-default"}>{title}</div>{" "}
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
