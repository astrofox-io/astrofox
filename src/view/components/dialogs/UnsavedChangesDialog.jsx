import useProject, {
	newProject,
	openProjectBrowser,
	saveProject,
} from "actions/project";
import Dialog from "components/window/Dialog";
import React from "react";

export default function UnsavedChangesDialog({ action, onClose }) {
	const project = useProject((state) => state);

	async function handleAction(action) {
		if (action === "new-project") {
			await newProject();
		} else if (action === "open-project") {
			await openProjectBrowser();
		}
	}

	async function handleConfirm(button) {
		if (button === "Yes") {
			const saved = await saveProject(project.projectName);

			if (saved) {
				await handleAction(action);
			}
		} else if (button === "No") {
			await handleAction(action);
		}
		onClose();
	}

	return (
		<Dialog
			message="Do you want to save project changes before closing?"
			buttons={["Yes", "No", "Cancel"]}
			onConfirm={handleConfirm}
		/>
	);
}
