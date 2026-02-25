import classNames from "classnames";
import React, { Children, cloneElement } from "react";

const ButtonGroup = ({ className, children }) => (
	<div className={classNames("group mr-[5px] [border-color:var(--input-border-color)] [&_.button]:mr-0 [&_.button]:border-r-0 [&_.button]:rounded-none [&_.button]:[border-color:inherit] [&_.button:first-child]:[border-top-left-radius:2px] [&_.button:first-child]:[border-bottom-left-radius:2px] [&_.button:last-child]:[border-top-right-radius:2px] [&_.button:last-child]:[border-bottom-right-radius:2px]", className)}>
		{Children.map(children, (child) =>
			cloneElement(child, {
				className: classNames("", child.props.className),
			}),
		)}
	</div>
);

export default ButtonGroup;
