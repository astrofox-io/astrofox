import React from "react";
import styles from "./ColorInput.module.tailwind";

export default function ColorInput({
	name = "color",
	value = "#ffffff",
	onChange = () => {},
}) {
	return (
		<div className={styles.wrapper}>
			<input
				type="color"
				className={styles.input}
				name={name}
				value={value}
				style={{ backgroundColor: value }}
				onChange={(e) => onChange(name, e.target.value)}
			/>
		</div>
	);
}
