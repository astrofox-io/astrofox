import classNames from "classnames";
import React from "react";
import styles from "./Button.module.tailwind";

const Button = ({ text, disabled, className, onClick }) => {
	return (
		<span
			className={classNames(styles.button, className, {
				[styles.disabled]: disabled,
			})}
			onClick={disabled ? null : onClick}
		>
			{text}
		</span>
	);
};

export default Button;
