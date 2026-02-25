import { inputValueToProps, mapChildren } from "@/lib/utils/react";
import Setting from "@/lib/view/components/controls/Setting";
import classNames from "classnames";
import React from "react";

export default function Settings({
	label,
	columns = [],
	className,
	children,
	onChange,
}) {
	const [labelWidth, inputWidth] = columns;

	function handleClone(child, props) {
		if (child.type === Setting) {
			return [child, props];
		}
		return [child];
	}

	return (
		<div className={classNames("flex flex-col p-4", className)}>
			{label && <div className={"text-text400 text-sm uppercase mb-4"}>{label}</div>}
			{mapChildren(
				children,
				{ labelWidth, inputWidth, onChange: inputValueToProps(onChange) },
				handleClone,
			)}
		</div>
	);
}
