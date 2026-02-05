import { useCallback, useState } from "react";

export default function useMergeState(initialState) {
	const [state, setState] = useState(initialState);

	const callback = useCallback(
		(props) => {
			if (typeof props === "function") {
				setState((state) => ({ ...state, ...props(state) }));
			} else {
				setState((state) => ({ ...state, ...props }));
			}
		},
		[setState],
	);

	return [state, callback];
}
