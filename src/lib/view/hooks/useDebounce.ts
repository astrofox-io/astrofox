import { useEffect, useState } from "react";

export default function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setValue(value);
		}, delay);

		return () => {
			clearTimeout(timer);
		};
	}, [value]);

	return debouncedValue;
}
