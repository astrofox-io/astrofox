import type Entity from "@/lib/core/Entity";
import { touchProject } from "@/app/actions/project";
import useForceUpdate from "@/app/hooks/useForceUpdate";
import useTimeout from "@/app/hooks/useTimeout";
import { useCallback } from "react";

export default function useEntity(entity: Entity | null, touchTimeout = 1000) {
	const forceUpdate = useForceUpdate();
	const touch = useTimeout(() => touchProject(), touchTimeout);

	return useCallback(
		(props: Record<string, unknown>) => {
			if (entity?.update(props)) {
				if (touchTimeout) {
					touch();
				}
				forceUpdate();
			}
		},
		[entity],
	);
}
