interface DisplayWithScene {
	properties: Record<string, unknown>;
	scene: { getSize(): { width: number; height: number } };
}

let labelCount: Record<string, number> = {};

export function resetLabelCount() {
	labelCount = {};
}

export function getDisplayName(label: string) {
	if (labelCount[label] === undefined) {
		labelCount[label] = 1;
	} else {
		labelCount[label] += 1;
	}

	return `${label} ${labelCount[label]}`;
}

export function property(name: string, compare?: unknown | ((value: unknown) => boolean)) {
	return (display: { properties: Record<string, unknown> }) => {
		const value = display.properties[name];
		if (compare !== undefined) {
			return typeof compare === "function" ? compare(value) : value === compare;
		}
		return value;
	};
}

export function stageWidth(transform?: (n: number) => number) {
	return (display: DisplayWithScene) => {
		const value = display.scene.getSize().width;
		return transform ? transform(value) : value;
	};
}

export function stageHeight(transform?: (n: number) => number) {
	return (display: DisplayWithScene) => {
		const value = display.scene.getSize().height;
		return transform ? transform(value) : value;
	};
}

export function maxSize() {
	return (display: DisplayWithScene) => {
		const { width, height } = display.scene.getSize();
		return Math.max(width, height);
	};
}
