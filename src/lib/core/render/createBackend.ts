import R3FBackend from "./R3FBackend";

export function createRenderBackend(
	_type: string,
	{ stage }: { stage: unknown },
) {
	return new R3FBackend(stage);
}

export default createRenderBackend;
