export function updateExistingProps(obj: object, props: Record<string, unknown>) {
	let changed = false;
	const target = obj as Record<string, unknown>;

	for (let keys = Object.keys(props), len = keys.length, i = 0; i < len; ++i) {
		const key = keys[i];
		if (key in target) {
			const value = props[key];
			if (value !== target[key]) {
				target[key] = value;
				changed = true;
			}
		}
	}

	return changed;
}

export function resolve(value: unknown, args: unknown[] = []) {
	return typeof value === "function" ? value(...args) : value;
}
