export function updateExistingProps(obj, props) {
	let changed = false;

	for (let keys = Object.keys(props), len = keys.length, i = 0; i < len; ++i) {
		const key = keys[i];
		if (key in obj) {
			const value = props[key];
			if (value !== obj[key]) {
				obj[key] = value;
				changed = true;
			}
		}
	}

	return changed;
}

export function resolve(value, args = []) {
	return typeof value === "function" ? value(...args) : value;
}
