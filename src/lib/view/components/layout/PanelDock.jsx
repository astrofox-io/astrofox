import { mapChildren } from "@/lib/utils/react";
import Panel from "@/lib/view/components/layout/Panel";
import useMeasure from "@/lib/view/hooks/useMeasure";
import classNames from "classnames";
import React from "react";

export default function PanelDock({
	direction = "vertical",
	side = "right",
	width,
	height,
	visible = true,
	children,
}) {
	const [ref, { width: maxWidth, height: maxHeight }] = useMeasure();

	function handleClone(child, props) {
		if (child.type === Panel) {
			return [child, { ...props }];
		}
		return null;
	}

	return (
		<div
			ref={ref}
			className={classNames("flex relative overflow-hidden bg-[var(--gray100)]", {
				"flex-col shrink-0": direction === "vertical",
				"flex-row shrink-0": direction !== "vertical",
				"border-b border-b-[var(--gray75)]": side === "top",
				"border-l border-l-[var(--gray75)]": side === "right",
				"border-t border-t-[var(--gray75)]": side === "bottom",
				"border-r border-r-[var(--gray75)]": side === "left",
				["hidden"]: !visible,
			})}
			style={{
				width,
				height,
			}}
		>
			{mapChildren(children, { maxWidth, maxHeight }, handleClone)}
		</div>
	);
}
