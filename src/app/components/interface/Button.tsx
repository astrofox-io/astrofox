import classNames from "classnames";
import React from "react";

interface ButtonProps {
	text?: string;
	disabled?: boolean;
	className?: string;
	onClick?: (() => void) | null;
}

const Button = ({ text, disabled, className, onClick }: ButtonProps) => {
	return (
		<span
			className={classNames(
				"inline-block bg-primary py-2 px-2.5 rounded-md cursor-default mr-2.5 [&:last-child]:mr-0 [&:hover]:bg-primary",
				className,
				{
					"text-neutral-300 bg-neutral-600": disabled,
				},
			)}
			onClick={disabled ? undefined : (onClick ?? undefined)}
		>
			{text}
		</span>
	);
};

export default Button;
