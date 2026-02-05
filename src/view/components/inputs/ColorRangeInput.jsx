import { ColorInput } from "components/inputs/index";
import React from "react";
import styles from "./ColorRangeInput.module.less";

export default function ColorRangeInput({
	name = "color",
	value = ["#ffffff", "#ffffff"],
	onChange,
}) {
	const [startColor, endColor] = value;

	return (
		<div className={styles.input}>
			<ColorInput
				name="startColor"
				value={startColor}
				onChange={(n, value) => onChange(name, [value, endColor])}
			/>
			<div
				className={styles.range}
				style={{
					backgroundImage: `-webkit-linear-gradient(left, ${startColor}, ${endColor})`,
				}}
			/>
			<ColorInput
				name="endColor"
				value={endColor}
				onChange={(n, value) => onChange(name, [startColor, value])}
			/>
		</div>
	);
}
