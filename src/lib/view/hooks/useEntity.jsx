import { touchProject } from "@/lib/view/actions/project";
import useForceUpdate from "@/lib/view/hooks/useForceUpdate";
import useTimeout from "@/lib/view/hooks/useTimeout";
import { useCallback } from "react";

export default function useEntity(entity, touchTimeout = 1000) {
	const forceUpdate = useForceUpdate();
	const touch = useTimeout(() => touchProject(), touchTimeout);

	return useCallback(
		(props) => {
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
