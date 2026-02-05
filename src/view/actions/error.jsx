import { logger } from "global";
import create from "zustand";
import { showModal } from "./modals";

const initialState = {
	error: null,
	message: null,
};

const errorStore = create(() => ({
	...initialState,
}));

export function clearError() {
	errorStore.setState({ ...initialState });
}

export function raiseError(message, error) {
	if (error) {
		logger.error(`${message}\n`, error.toString());
	}

	errorStore.setState({ message, error });

	showModal("ErrorDialog", { title: "Error" });
}

export default errorStore;
