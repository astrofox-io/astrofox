import classNames from "classnames";
import React, { Children, cloneElement } from "react";
import styles from "./ButtonGroup.module.tailwind";

const ButtonGroup = ({ className, children }) => (
	<div className={classNames(styles.group, className)}>
		{Children.map(children, (child) =>
			cloneElement(child, {
				className: classNames(styles.button, child.props.className),
			}),
		)}
	</div>
);

export default ButtonGroup;
