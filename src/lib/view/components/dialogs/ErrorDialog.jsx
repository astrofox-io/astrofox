import useError, { clearError } from "@/view/actions/error";
import Dialog from "@/view/components/window/Dialog";
import { Warning } from "@/view/icons";
import React from "react";

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
