import { useCallback, useState } from "react";

export default function useMergeState<T extends Record<string, unknown>>(
	initialState?: T,
) {
	const [state, setState] = useState<T>(initialState ?? ({} as T));

	const callback = useCallback(
		(props: Partial<T> | ((state: T) => Partial<T>)) => {
			if (typeof props === "function") {
				setState((state: T) => ({ ...state, ...props(state) }));
			} else {
				setState((state: T) => ({ ...state, ...props }));
			}
		},
		[setState],
	);

	return [state, callback] as const;
}
