import Icon from "@/lib/view/components/interface/Icon";
import classNames from "classnames";
import React from "react";

const ButtonInput = ({
	title,
	icon,
	text,
	active,
	disabled,
	onClick,
	className,
}) => (
	<div
		className={classNames(
			"text-[var(--text100)] bg-[var(--input-bg-color)] min-h-6 min-w-6 text-center rounded-sm inline-flex justify-center items-center cursor-default shrink-0 [&:hover]:bg-[var(--primary100)]",
			{
				["bg-[var(--primary100)]"]: active,
				["[&_svg]:text-[var(--gray500)] [&:hover]:bg-[var(--input-bg-color)]"]: disabled,
			},
			className,
		)}
		title={title}
		onClick={disabled ? null : onClick}
	>
		{icon && <Icon className={"text-[var(--text100)] w-3 h-3"} glyph={icon} />}
		{text && <span className={"text-[var(--font-size-small)]"}>{text}</span>}
	</div>
);

export default ButtonInput;
