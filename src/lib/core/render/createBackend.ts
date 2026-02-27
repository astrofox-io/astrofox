import R3FBackend from "./R3FBackend";

export function createRenderBackend(_type, { stage }) {
	return new R3FBackend(stage);
}

export default createRenderBackend;
