import { useEffect, useState } from "react";

export default function useDebounce(value, delay) {
	const [debouncedValue, setValue] = useState(value);

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
