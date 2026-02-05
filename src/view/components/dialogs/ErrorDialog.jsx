import useError, { clearError } from "actions/error";
import Dialog from "components/window/Dialog";
import React from "react";
import { Warning } from "view/icons";

export default function ErrorDialog({ onClose }) {
	const message = useError((state) => state.message);

	function handleConfirm() {
		clearError();
		onClose();
	}

	return (
		<Dialog
			icon={Warning}
			message={message}
			buttons={["Ok"]}
			onConfirm={handleConfirm}
		/>
	);
}
