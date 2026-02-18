import useConfig, { saveConfig } from "@/view/actions/config";
import { Setting, Settings } from "@/view/components/controls";
import Button from "@/view/components/interface/Button";
import ButtonRow from "@/view/components/layout/ButtonRow";
import Layout from "@/view/components/layout/Layout";
import React, { useState } from "react";

export default function AppSettings({ onClose }) {
	const appConfig = useConfig((state) => state);
	const [state, setState] = useState(appConfig);
	const { autoPlayAudio } = state;

	function handleChange(props) {
		setState((state) => ({ ...state, ...props }));
	}

	async function handleSave() {
		await saveConfig(state);
		onClose();
	}

	return (
		<Layout width={500}>
			<Settings label="Audio" columns={["60%", "40%"]} onChange={handleChange}>
				<Setting
					label="Play audio on load"
					type="checkbox"
					name="autoPlayAudio"
					value={autoPlayAudio}
				/>
			</Settings>
			<ButtonRow>
				<Button text="Save" onClick={handleSave} />
				<Button text="Cancel" onClick={onClose} />
			</ButtonRow>
		</Layout>
	);
}
