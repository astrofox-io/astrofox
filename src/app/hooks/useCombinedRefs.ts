import type React from "react";
import { useEffect, useRef } from "react";

type RefCallback<T> = (instance: T | null) => void;
type MutableRef<T> = React.MutableRefObject<T | null>;
type CombinedRef<T> = RefCallback<T> | MutableRef<T> | null | undefined;

export default function useCombinedRefs<T extends HTMLElement>(
	...refs: CombinedRef<T>[]
) {
	const targetRef = useRef<T>(null);

	useEffect(() => {
		refs.forEach((ref) => {
			if (!ref) return;

			if (typeof ref === "function") {
				ref(targetRef.current);
			} else {
				(ref as MutableRef<T>).current = targetRef.current;
			}
		});
	}, [refs]);

	return targetRef;
}
