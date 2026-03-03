import { reactors, stage } from "@/lib/view/global";
import create from "zustand";
import { setActiveReactorId } from "./app";
import { loadScenes } from "./scenes";

interface ReactorState {
	reactors: Record<string, unknown>[];
}

const initialState: ReactorState = {
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

export function addReactor(reactor?: unknown) {
	const newReactor = reactors.addReactor(reactor);

	loadReactors();

	return newReactor;
}

export function removeReactor(reactor: { id: string }) {
	// Clean up all display references to this reactor
	stage.scenes.forEach(
		(scene: {
			displays: {
				reactors?: Record<string, { id: string }>;
				removeReactor: (prop: string) => void;
			}[];
			effects: {
				reactors?: Record<string, { id: string }>;
				removeReactor: (prop: string) => void;
			}[];
		}) => {
			[...scene.displays, ...scene.effects].forEach((display) => {
				if (display.reactors) {
					for (const [prop, config] of Object.entries(display.reactors)) {
						if (config.id === reactor.id) {
							display.removeReactor(prop);
						}
					}
				}
			});
		},
	);

	reactors.removeReactor(reactor);

	loadReactors();
	loadScenes();
}

export function updateReactorProperty(
	reactorId: string,
	prop: string,
	value: unknown,
) {
	const reactor = reactors.getElementById(reactorId);

	if (reactor) {
		reactor[prop] = value;
		loadReactors();
	}
}

export function clearReactors() {
	reactors.clearReactors();

	loadReactors();
}

export default reactorStore;
