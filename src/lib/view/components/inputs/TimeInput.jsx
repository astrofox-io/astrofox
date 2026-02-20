import { formatSeekTime, parseSeekTime } from "@/lib/utils/format";
import { clamp } from "@/lib/utils/math.js";
import TextInput from "@/lib/view/components/inputs/TextInput";
import React, { useState } from "react";

export default function TimeInput({
	name = "time",
	value = 0,
	width = 140,
	size,
	min,
	max,
	readOnly = false,
	disabled = false,
	onChange,
}) {
	const [key, setKey] = useState(0);

	function handleChange(name, value) {
		let time = parseSeekTime(value);

		if (time !== null) {
			// Clamp to min/max
			if (min !== undefined && max !== undefined) {
				if (time < min || time > max) {
					setKey(key + 1);
				}
				time = clamp(time, min, max);
			}

			onChange(name, time);
		}
		// Reset to previous value
		else {
			setKey(key + 1);
		}
	}

	return (
		<TextInput
			key={key}
			name={name}
			width={width}
			size={size}
			buffered
			readOnly={readOnly}
			disabled={disabled}
			value={formatSeekTime(value)}
			onChange={handleChange}
		/>
	);
}
