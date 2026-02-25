import classNames from "classnames";
import React from "react";

const Button = ({ text, disabled, className, onClick }) => {
	return (
		<span
			className={classNames(
				"inline-block bg-primary100 py-2 px-2.5 rounded cursor-default mr-2.5 [&:last-child]:mr-0 [&:hover]:bg-primary200",
				className,
				{
					"text-text200 bg-gray400": disabled,
				},
			)}
			onClick={disabled ? null : onClick}
		>
			{text}
		</span>
	);
};

export default Button;
