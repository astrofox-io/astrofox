import classNames from "classnames";
import React, { Children, cloneElement } from "react";

export default function OptionGroup({ title, className, children, ...props }) {
	return (
		<div className={classNames("group flex flex-col", className)}>
			{title && <div className={"flex"}>{title}</div>}
			<div className={"relative"}>
				{Children.map(children, (child) => {
					if (child) {
						return cloneElement(child, { ...props });
					}
					return child;
				})}
			</div>
		</div>
	);
}
