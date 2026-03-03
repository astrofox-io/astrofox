import { ColorInput } from "@/app/components/inputs/index";
import React from "react";

interface ColorRangeInputProps {
	name?: string;
	value?: [string, string];
	onChange?: (name: string, value: [string, string]) => void;
}

export default function ColorRangeInput({
	name = "color",
	value = ["#ffffff", "#ffffff"],
	onChange,
}: ColorRangeInputProps) {
	const [startColor, endColor] = value;

	return (
		<div className={"flex flex-row items-center w-full"}>
			<ColorInput
				name="startColor"
				value={startColor}
				onChange={(_n: string, value: string) =>
					onChange?.(name, [value, endColor])
				}
			/>
			<div
				className={
					"flex-1 relative h-4 border border-neutral-600 rounded my-0 mx-2"
				}
				style={{
					backgroundImage: `-webkit-linear-gradient(left, ${startColor}, ${endColor})`,
				}}
			/>
			<ColorInput
				name="endColor"
				value={endColor}
				onChange={(_n: string, value: string) =>
					onChange?.(name, [startColor, value])
				}
			/>
		</div>
	);
}
