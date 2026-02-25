import classNames from "classnames";
import React from "react";
import styles from "./MenuItem.module.tailwind";

const MenuItem = ({ label, checked, disabled, onClick }) => (
	<div
		className={classNames(styles.item, {
			[styles.checked]: checked,
			[styles.disabled]: disabled,
		})}
		onClick={onClick}
	>
		{label}
	</div>
);

export default MenuItem;
