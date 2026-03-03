import { useCallback, useRef } from "react";

export default function useTimeout(func: () => void, delay: number) {
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	return useCallback(() => {
		if (timer.current) {
			clearTimeout(timer.current);
		}
		timer.current = setTimeout(func, delay);
	}, [func, delay]);
}
