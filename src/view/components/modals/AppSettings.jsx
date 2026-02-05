import useConfig, { saveConfig } from "actions/config";
import { Setting, Settings } from "components/controls";
import Button from "components/interface/Button";
import ButtonRow from "components/layout/ButtonRow";
import Layout from "components/layout/Layout";
import React, { useState } from "react";

export default function AppSettings({ onClose }) {
	const appConfig = useConfig((state) => state);
	const [state, setState] = useState(appConfig);
	const { checkForUpdates, autoUpdate, autoPlayAudio } = state;

	function handleChange(props) {
		setState((state) => ({ ...state, ...props }));
	}

	async function handleSave() {
		await saveConfig(state);
		onClose();
	}

	return (
		<Layout width={500}>
			<Settings
				label="General"
				columns={["60%", "40%"]}
				onChange={handleChange}
			>
				<Setting
					label="Check for updates on start up"
					type="checkbox"
					name="checkForUpdates"
					value={checkForUpdates}
				/>
				<Setting
					label="Automatically download and install updates"
					type="checkbox"
					name="autoUpdate"
					value={autoUpdate}
				/>
			</Settings>
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
