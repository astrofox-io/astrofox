import R3FBackend from "./R3FBackend";

export function createRenderBackend(type, { stage }) {
	if (type && type !== "r3f") {
		console.warn(
			`[render] Backend "${type}" is deprecated. Using "r3f" instead.`,
		);
	}

	return new R3FBackend(stage);
}

export default createRenderBackend;
