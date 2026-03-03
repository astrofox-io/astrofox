import {
	Children,
	Fragment,
	type ReactElement,
	type ReactNode,
	cloneElement,
} from "react";

export function ignoreEvents(e: {
	stopPropagation(): void;
	preventDefault(): void;
}) {
	e.stopPropagation();
	e.preventDefault();
}

export function inputValueToProps(
	callback: (props: Record<string, unknown>) => void,
) {
	return (name: string | Record<string, unknown>, value?: unknown) => {
		if (name && typeof name === "object" && !Array.isArray(name)) {
			callback(name);
			return;
		}

		callback({ [name as string]: value });
	};
}

export function mapChildren(
	children: ReactNode,
	props: Record<string, unknown>,
	callback?: (
		child: ReactElement,
		props: Record<string, unknown>,
		index: number,
	) => ReactElement[],
): ReactNode {
	return Children.map(children, (child, index) => {
		if (child) {
			const element = child as ReactElement<{ children?: ReactNode }>;
			if (element.type === Fragment) {
				return mapChildren(element.props.children, props);
			}

			const args = callback
				? callback(element, props, index)
				: ([element, props] as [ReactElement, Record<string, unknown>]);
			const [el, cloneProps] = args;

			return cloneProps ? cloneElement(el, cloneProps) : cloneElement(el);
		}
		return child;
	});
}
