import classNames from "classnames";
import React from "react";

import inputComponents from "./inputComponents";

export default function Setting({
	label,
	type,
	name,
	value,
	className,
	labelWidth,
	inputWidth,
	onChange,
	hidden,
	children,
	...otherProps
}) {
	const [InputCompnent, inputProps] = inputComponents[type] ?? [];

	return (
		<div
			className={classNames("flex items-center mb-4 [&_>_*]:mr-2 [&_>_*:last-child]:mr-0", className, {
				["hidden"]: hidden,
			})}
		>
			<div className={"text-text200"} style={{ width: labelWidth }}>
				{label}
			</div>
			<div style={{ width: inputWidth }}>
				{InputCompnent && (
					<InputCompnent
						{...inputProps}
						{...otherProps}
						name={name}
						value={value}
						onChange={onChange}
					/>
				)}
				{children}
			</div>
		</div>
	);
}
