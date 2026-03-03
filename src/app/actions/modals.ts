import { uniqueId } from "@/lib/utils/crypto";
import create from "zustand";

interface Modal {
	id: string;
	component: string;
	modalProps?: Record<string, unknown>;
	componentProps?: Record<string, unknown>;
}

interface ModalState {
	modals: Modal[];
}

const initialState: ModalState = {
	modals: [],
};

const modalStore = create(() => ({
	...initialState,
}));

export function showModal(
	component: string,
	modalProps?: Record<string, unknown>,
	componentProps?: Record<string, unknown>,
) {
	modalStore.setState(({ modals }: ModalState) => ({
		modals: modals.concat({
			id: uniqueId(),
			component,
			modalProps,
			componentProps,
		}),
	}));
}

export function closeModal() {
	modalStore.setState(({ modals }: ModalState) => ({
		modals: modals.slice(0, -1),
	}));
}

export default modalStore;
