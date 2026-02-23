import useProject, {
	newProject,
	openProjectBrowser,
	saveProject,
} from "@/lib/view/actions/project";
import Dialog from "@/lib/view/components/window/Dialog";
import React from "react";

export default function UnsavedChangesDialog({ action, onClose }) {
	const project = useProject((state) => state);

	async function handleAction(actionType) {
		if (actionType === "new-project") {
			await newProject();
		} else if (actionType === "open-project") {
			await openProjectBrowser();
		}
	}

	async function closeThenRunAction() {
		onClose();
		await Promise.resolve();
		await handleAction(action);
	}

	async function handleConfirm(button) {
		if (button === "Yes") {
			const saved = await saveProject(project.projectName);

			if (saved) {
				await closeThenRunAction();
			}
		} else if (button === "No") {
			await closeThenRunAction();
		} else {
			onClose();
		}
	}

	return (
		<Dialog
			message="Do you want to save project changes before closing?"
			buttons={["Yes", "No", "Cancel"]}
			onConfirm={handleConfirm}
		/>
	);
}
