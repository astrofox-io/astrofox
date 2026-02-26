// @ts-nocheck
import { Children, Fragment, cloneElement } from "react";

export function ignoreEvents(e) {
	e.stopPropagation();
	e.preventDefault();
}

export function inputValueToProps(callback) {
	return (name, value) => {
		if (name && typeof name === "object" && !Array.isArray(name)) {
			callback(name);
			return;
		}

		callback({ [name]: value });
	};
}

export function mapChildren(children, props, callback) {
	return Children.map(children, (child, index) => {
		if (child) {
			if (child.type === Fragment) {
				return mapChildren(child.props.children, props);
			}

			const args = callback ? callback(child, props, index) : [child, props];

			return cloneElement(...args);
		}
		return child;
	});
}
