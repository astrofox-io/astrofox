import { reactors } from "@/view/global";
import create from "zustand";
import { setActiveReactorId } from "./app";

const initialState = {
	reactors: [],
};

const reactorStore = create(() => ({
	...initialState,
}));

export function loadReactors() {
	reactorStore.setState({ reactors: reactors.toJSON() });
}

export function resetReactors() {
	reactorStore.setState({ ...initialState });

	reactors.clearReactors();

	setActiveReactorId(null);
}

export function addReactor(reactor) {
	const newReactor = reactors.addReactor(reactor);

	loadReactors();

	return newReactor;
}

export function removeReactor(reactor) {
	reactors.removeReactor(reactor);

	loadReactors();
}

export function clearReactors() {
	reactors.clearReactors();

	loadReactors();
}

export default reactorStore;
