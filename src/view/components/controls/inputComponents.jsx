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
} from "@/view/components/inputs";

const inputComponents = {
	text: [TextInput, { width: 140 }],
	number: [NumberInput, { width: 40 }],
	toggle: [ToggleInput],
	checkbox: [CheckboxInput],
	color: [ColorInput],
	colorrange: [ColorRangeInput],
	range: [RangeInput],
	select: [SelectInput, { width: 140 }],
	image: [ImageInput],
	video: [VideoInput],
	time: [TimeInput],
};

export default inputComponents;
