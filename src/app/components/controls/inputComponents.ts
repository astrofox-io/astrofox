import {
	CheckboxInput,
	ColorInput,
	ColorRangeInput,
	ImageInput,
	NumberInput,
	RangeInput,
	SelectInput,
	TextInput,
	TimeInput,
	ToggleInput,
	VideoInput,
} from "@/app/components/inputs";

type InputComponentEntry = [
	React.ComponentType<Record<string, unknown>>,
	Record<string, unknown>?,
];

const inputComponents: Record<string, InputComponentEntry> = {
	text: [
		TextInput as unknown as React.ComponentType<Record<string, unknown>>,
		{ width: 140 },
	],
	number: [
		NumberInput as unknown as React.ComponentType<Record<string, unknown>>,
		{ width: 40 },
	],
	toggle: [
		ToggleInput as unknown as React.ComponentType<Record<string, unknown>>,
	],
	checkbox: [
		CheckboxInput as unknown as React.ComponentType<Record<string, unknown>>,
	],
	color: [
		ColorInput as unknown as React.ComponentType<Record<string, unknown>>,
	],
	colorrange: [
		ColorRangeInput as unknown as React.ComponentType<Record<string, unknown>>,
	],
	range: [
		RangeInput as unknown as React.ComponentType<Record<string, unknown>>,
	],
	select: [
		SelectInput as unknown as React.ComponentType<Record<string, unknown>>,
		{ width: 140 },
	],
	image: [
		ImageInput as unknown as React.ComponentType<Record<string, unknown>>,
	],
	video: [
		VideoInput as unknown as React.ComponentType<Record<string, unknown>>,
	],
	time: [TimeInput as unknown as React.ComponentType<Record<string, unknown>>],
};

export default inputComponents;
