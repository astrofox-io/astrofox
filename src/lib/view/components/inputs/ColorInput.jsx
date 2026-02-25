import React from "react";

export default function ColorInput({
	name = "color",
	value = "#ffffff",
	onChange = () => {},
}) {
	return (
		<div className={"flex items-center justify-center w-6 h-6 rounded-full border border-input-border bg-input-bg"}>
			<input
				type="color"
				className={"w-4 h-4 rounded-full border-0 [&::-webkit-color-swatch-wrapper]:hidden [&::-webkit-color-swatch]:hidden"}
				name={name}
				value={value}
				style={{ backgroundColor: value }}
				onChange={(e) => onChange(name, e.target.value)}
			/>
		</div>
	);
}
