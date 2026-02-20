import classNames from "classnames";
import React from "react";
import styles from "./ToggleInput.module.less";

export default function ToggleInput({
	name = "toggle",
	value = false,
	label,
	labelPosition = "right",
	onChange,
}) {
	return (
		<div className={styles.toggle}>
			<div
				className={classNames(styles.input, {
					[styles.on]: value,
				})}
				onClick={() => onChange(name, !value)}
			/>
			{label && (
				<div
					className={classNames(styles.label, {
						[styles.left]: labelPosition === "left",
						[styles.right]: labelPosition === "right",
					})}
				>
					{label}
				</div>
			)}
		</div>
	);
}
