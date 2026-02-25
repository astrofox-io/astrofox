import classNames from "classnames";
import React from "react";

const Button = ({ text, disabled, className, onClick }) => {
	return (
		<span
			className={classNames(
				"inline-block bg-[var(--primary100)] p-[8px_10px] rounded-[3px] cursor-default mr-[10px] [&:last-child]:mr-0 [&:hover]:bg-[var(--primary200)]",
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
