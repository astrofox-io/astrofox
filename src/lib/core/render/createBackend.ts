import LegacyBackend from "./LegacyBackend";
import R3FBackend from "./R3FBackend";

export function createRenderBackend(type, { stage }) {
	switch (type) {
		case "legacy":
			return new LegacyBackend(stage);

		case "r3f":
			return new R3FBackend(stage);

		default:
			console.warn(
				`[render] Unknown backend "${type}". Falling back to legacy backend.`,
			);
			return new LegacyBackend(stage);
	}
}

export default createRenderBackend;
