import classNames from "classnames";
import React, { Children, cloneElement, isValidElement } from "react";

interface OptionGroupProps {
	title?: React.ReactNode;
	className?: string;
	children?: React.ReactNode;
	[key: string]: unknown;
}

export default function OptionGroup({ title, className, children, ...props }: OptionGroupProps) {
	return (
		<div className={classNames("group flex flex-col", className)}>
			{title && <div className={"flex"}>{title}</div>}
			<div className={"relative"}>
				{Children.map(children, (child) => {
					if (child && isValidElement<Record<string, unknown>>(child)) {
						return cloneElement(child, { ...props });
					}
					return child;
				})}
			</div>
		</div>
	);
}
