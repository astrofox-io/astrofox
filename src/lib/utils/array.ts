export function isDefined(...arr: unknown[]) {
	return arr.filter((e: unknown) => e !== undefined).length > 0;
}

export function contains<T>(arr1: T[], arr2: T[]) {
	return arr1.some((e: T) => arr2.includes(e));
}

export function reverse<T>(arr: T[]): T[] {
	return [...arr].reverse();
}
