import classNames from "classnames";
import React from "react";

export default function Layout({
	className,
	children,
	direction = "column",
	grow = true,
	full = false,
	width,
	height,
	padding,
	margin,
	...props
}: any) {
	return (
		<div
			{...props}
			className={classNames("flex overflow-hidden relative", className, {
				["flex-row"]: direction === "row",
				["flex-col"]: direction === "column",
				["flex-1"]: grow,
				["w-full h-full"]: full,
			})}
			style={{ width, height, padding, margin }}
		>
			{children}
		</div>
	);
}
