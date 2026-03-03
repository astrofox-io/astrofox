import { logger } from "@/lib/view/global";
import create from "zustand";
import { showModal } from "./modals";

interface ErrorState {
	error: string | null;
	message: string | null;
}

const initialState: ErrorState = {
	error: null,
	message: null,
};

const errorStore = create<ErrorState>(() => ({
	...initialState,
}));

export function clearError() {
	errorStore.setState({ ...initialState });
}

export function raiseError(message: string, error?: unknown) {
	if (error) {
		logger.error(`${message}\n`, String(error));
	}

	errorStore.setState({ message, error: error ? String(error) : null });

	showModal("ErrorDialog", { title: "Error" });
}

export default errorStore;
