import { clamp, roundTo } from "@/lib/utils/math";
import TextInput from "@/lib/view/components/inputs/TextInput";
import React, { useState } from "react";

export default function NumberInput({
	name = "number",
	value = 0,
	width = 40,
	min = false,
	max = false,
	step = false,
	readOnly = false,
	disabled = false,
	className,
	onChange,
}: any) {
	const [key, setKey] = useState(0);

	function handleChange(name, value) {
		const regex = /^(0|-?([0-9]*\.[0-9]+|[1-9]+[0-9]*))$/;

		// If valid number, send new value to parent
		if (regex.test(value)) {
			let newValue = +value;

			// Clamp to min/max
			if (min !== false && max !== false) {
				newValue = clamp(newValue, min, max);
			}

			// Round value to nearest interval
			if (step !== false) {
				newValue = roundTo(newValue, step);
			}

			// Force value to update
			if (newValue !== +value) {
				setKey(key + 1);
			}

			onChange(name, newValue);
		}
		// Reset to old value
		else {
			setKey(key + 1);
		}
	}

	return (
		<TextInput
			key={key}
			name={name}
			value={value}
			className={className}
			width={width}
			onChange={handleChange}
			readOnly={readOnly}
			disabled={disabled}
			buffered
		/>
	);
}
