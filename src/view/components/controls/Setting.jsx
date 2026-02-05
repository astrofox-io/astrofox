import classNames from "classnames";
import React from "react";
import styles from "./Setting.module.less";
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
			className={classNames(styles.setting, className, {
				[styles.hidden]: hidden,
			})}
		>
			<div className={styles.label} style={{ width: labelWidth }}>
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
