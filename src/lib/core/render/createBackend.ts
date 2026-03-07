import HybridBackend from "./HybridBackend";
import R3FBackend from "./R3FBackend";

export function createRenderBackend(
	type: string,
	{ stage }: { stage: unknown },
) {
	if (type === "r3f") {
		return new R3FBackend(stage);
	}

	return new HybridBackend(stage);
}

export default createRenderBackend;
