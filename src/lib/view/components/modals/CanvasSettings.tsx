import useStage, { updateCanvas } from "@/lib/view/actions/stage";
import { Setting, Settings } from "@/lib/view/components/controls";
import Button from "@/lib/view/components/interface/Button";
import ButtonRow from "@/lib/view/components/layout/ButtonRow";
import Layout from "@/lib/view/components/layout/Layout";
import React, { useState } from "react";

type CanvasSettingsProps = {
	onClose: () => void;
};

type CanvasSettingsState = {
	backgroundColor: string;
	baseSize: number;
	aspect: string;
};

const CANVAS_BASE_SIZES = [480, 720, 1080];

const CANVAS_ASPECT_OPTIONS = [
	{ label: "Square", value: "1:1", widthRatio: 1, heightRatio: 1 },
	{ label: "Portrait (9:16)", value: "9:16", widthRatio: 9, heightRatio: 16 },
	{
		label: "Landscape (16:9)",
		value: "16:9",
		widthRatio: 16,
		heightRatio: 9,
	},
	{
		label: "Mobile portrait (3:4)",
		value: "3:4",
		widthRatio: 3,
		heightRatio: 4,
	},
	{
		label: "Mobile landscape (4:3)",
		value: "4:3",
		widthRatio: 4,
		heightRatio: 3,
	},
];

function toEven(value) {
	return Math.max(2, Math.round(value / 2) * 2);
}

function getAspectByValue(value) {
	return (
		CANVAS_ASPECT_OPTIONS.find((aspect) => aspect.value === value) ||
		CANVAS_ASPECT_OPTIONS[2]
	);
}

function getNearestBaseSize(size) {
	return CANVAS_BASE_SIZES.reduce((nearest, current) => {
		return Math.abs(current - size) < Math.abs(nearest - size)
			? current
			: nearest;
	}, CANVAS_BASE_SIZES[0]);
}

function getInitialAspect(width, height) {
	const ratio = width > 0 && height > 0 ? width / height : 16 / 9;

	return CANVAS_ASPECT_OPTIONS.reduce(
		(nearest, aspect) => {
			const currentRatio = aspect.widthRatio / aspect.heightRatio;

			return Math.abs(currentRatio - ratio) < Math.abs(nearest.ratio - ratio)
				? { value: aspect.value, ratio: currentRatio }
				: nearest;
		},
		{ value: "16:9", ratio: 16 / 9 },
	).value;
}

function getCanvasDimensions(baseSize, aspectValue) {
	const aspect = getAspectByValue(aspectValue);
	const ratio = aspect.widthRatio / aspect.heightRatio;

	if (ratio >= 1) {
		return {
			width: toEven(baseSize * ratio),
			height: toEven(baseSize),
		};
	}

	return {
		width: toEven(baseSize),
		height: toEven(baseSize / ratio),
	};
}

export default function CanvasSettings({ onClose }: CanvasSettingsProps) {
	const stageConfig = useStage((state) => state);
	const [state, setState] = useState({
		backgroundColor: stageConfig.backgroundColor,
		baseSize: getNearestBaseSize(
			Math.min(stageConfig.width, stageConfig.height),
		),
		aspect: getInitialAspect(stageConfig.width, stageConfig.height),
	});
	const { baseSize, aspect, backgroundColor } = state;
	const { width, height } = getCanvasDimensions(baseSize, aspect);

	function handleChange(props: Partial<CanvasSettingsState>) {
		setState((current) => ({ ...current, ...props }));
	}

	function handleCancel() {
		onClose();
	}

	async function handleSave() {
		await updateCanvas(width, height, backgroundColor);
		onClose();
	}

	return (
		<Layout width={500}>
			<Settings columns={["50%", "50%"]} onChange={handleChange}>
				<Setting
					label="Format"
					type="select"
					name="aspect"
					value={aspect}
					items={CANVAS_ASPECT_OPTIONS}
					width={180}
					optionsWidth={220}
				/>
				<Setting
					label="Size"
					type="select"
					name="baseSize"
					value={baseSize}
					items={CANVAS_BASE_SIZES.map((size) => ({
						label: `${size}p`,
						value: size,
					}))}
					width={100}
				/>
				<Setting
					label="Background Color"
					type="color"
					name="backgroundColor"
					value={backgroundColor}
				/>
			</Settings>
			<div className={"px-4 pb-2 text-sm text-text300"}>
				Output: {width} x {height}
			</div>
			<ButtonRow>
				<Button onClick={handleSave} text="OK" />
				<Button onClick={handleCancel} text="Cancel" />
			</ButtonRow>
		</Layout>
	);
}
