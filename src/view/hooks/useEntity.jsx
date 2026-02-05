import { touchProject } from "actions/project";
import useForceUpdate from "hooks/useForceUpdate";
import useTimeout from "hooks/useTimeout";
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
