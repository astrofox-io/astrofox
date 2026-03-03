import React from "react";

interface ColorInputProps {
	name?: string;
	value?: string;
	onChange?: (name: string, value: string) => void;
}

export default function ColorInput({
	name = "color",
	value = "#ffffff",
	onChange,
}: ColorInputProps) {
	return (
		<div className={"flex items-center justify-center w-6 h-6 rounded-full border border-neutral-600 bg-neutral-900"}>
			<input
				type="color"
				className={"w-4 h-4 rounded-full border-0 [&::-webkit-color-swatch-wrapper]:hidden [&::-webkit-color-swatch]:hidden"}
				name={name}
				value={value}
				style={{ backgroundColor: value }}
				onChange={(e) => onChange?.(name, e.target.value)}
			/>
		</div>
	);
}
