import { formatSeekTime, parseSeekTime } from "@/lib/utils/format";
import { clamp } from "@/lib/utils/math";
import TextInput from "@/app/components/inputs/TextInput";
import React, { useState } from "react";

interface TimeInputProps {
	name?: string;
	value?: number;
	width?: number;
	size?: number | null;
	min?: number;
	max?: number;
	readOnly?: boolean;
	disabled?: boolean;
	onChange?: (name: string, value: number) => void;
}

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
}: TimeInputProps) {
	const [key, setKey] = useState(0);

	function handleChange(name: string, value: string) {
		let time = parseSeekTime(value);

		if (time !== null) {
			// Clamp to min/max
			if (min !== undefined && max !== undefined) {
				if (time < min || time > max) {
					setKey(key + 1);
				}
				time = clamp(time, min, max);
			}

			onChange?.(name, time);
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
