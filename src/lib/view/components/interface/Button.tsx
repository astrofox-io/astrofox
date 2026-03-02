import classNames from "classnames";
import React from "react";

const Button = ({ text, disabled, className, onClick }: any) => {
	return (
		<span
			className={classNames(
				"inline-block bg-violet-600 py-2 px-2.5 rounded-md cursor-default mr-2.5 [&:last-child]:mr-0 [&:hover]:bg-violet-500",
				className,
				{
					"text-neutral-300 bg-neutral-600": disabled,
				},
			)}
			onClick={disabled ? null : onClick}
		>
			{text}
		</span>
	);
};

export default Button;
