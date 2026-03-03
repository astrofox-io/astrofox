import { useEffect, useState } from "react";

type Listener<T> = (state: T) => void;

let listeners: Listener<Record<string, unknown>>[] = [];
let state: Record<string, unknown> = {};

function setState(newState: Partial<Record<string, unknown>>) {
	state = { ...state, ...newState };
	listeners.forEach((listener) => {
		listener(state);
	});
}

export default function useSharedState(initialState?: Record<string, unknown>) {
	const [, newListener] = useState<Record<string, unknown>>();

	if (initialState && Object.keys(state).length === 0) {
		state = initialState;
	}

	useEffect(() => {
		const listener: Listener<Record<string, unknown>> = (s) => newListener(s);
		listeners.push(listener);

		return () => {
			listeners = listeners.filter((e) => e !== listener);
		};
	}, []);

	return [state, setState] as const;
}
