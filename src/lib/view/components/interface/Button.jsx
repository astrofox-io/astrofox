import classNames from "classnames";
import React from "react";

const Button = ({ text, disabled, className, onClick }) => {
	return (
		<span
			className={classNames(
				"inline-block bg-[var(--primary100)] py-2 px-2.5 rounded cursor-default mr-2.5 [&:last-child]:mr-0 [&:hover]:bg-[var(--primary200)]",
				className,
				{
					"text-[var(--text200)] bg-[var(--gray400)]": disabled,
				},
			)}
			onClick={disabled ? null : onClick}
		>
			{text}
		</span>
	);
};

export default Button;
