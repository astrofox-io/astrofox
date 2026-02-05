import useStage, { updateCanvas } from "actions/stage";
import { Setting, Settings } from "components/controls";
import Button from "components/interface/Button";
import ButtonRow from "components/layout/ButtonRow";
import Layout from "components/layout/Layout";
import React, { useState } from "react";
import {
	MAX_CANVAS_HEIGHT,
	MAX_CANVAS_WIDTH,
	MIN_CANVAS_HEIGHT,
	MIN_CANVAS_WIDTH,
} from "view/constants";

export default function CanvasSettings({ onClose }) {
	const stageConfig = useStage((state) => state);
	const [state, setState] = useState(stageConfig);
	const { width, height, backgroundColor } = state;

	function handleChange(props) {
		setState({ ...state, ...props });
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
					label="Width"
					type="number"
					name="width"
					value={width}
					min={MIN_CANVAS_WIDTH}
					max={MAX_CANVAS_WIDTH}
					step={2}
				/>
				<Setting
					label="Height"
					type="number"
					name="height"
					value={height}
					min={MIN_CANVAS_HEIGHT}
					max={MAX_CANVAS_HEIGHT}
					step={2}
				/>
				<Setting
					label="Background Color"
					type="color"
					name="backgroundColor"
					value={backgroundColor}
				/>
			</Settings>
			<ButtonRow>
				<Button onClick={handleSave} text="OK" />
				<Button onClick={handleCancel} text="Cancel" />
			</ButtonRow>
		</Layout>
	);
}
