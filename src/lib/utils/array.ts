export function isDefined(...arr) {
	return arr.filter((e) => e !== undefined).length > 0;
}

export function contains(arr1, arr2) {
	return arr1.some((e) => arr2.includes(e));
}

export function reverse(arr) {
	return [...arr].reverse();
}
