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
}: any) => (
	<div
		className={classNames(
			"text-neutral-100 bg-neutral-900 min-h-6 min-w-6 text-center rounded-md inline-flex justify-center items-center cursor-default shrink-0 [&:hover]:bg-primary",
			{
				["bg-primary"]: active,
				["opacity-30 hover:!bg-neutral-900"]: disabled,
			},
			className,
		)}
		title={title}
		onClick={disabled ? null : onClick}
	>
		{icon && <Icon className={"text-neutral-100 w-4 h-4"} glyph={icon} />}
		{text && <span className={"text-sm"}>{text}</span>}
	</div>
);

export default ButtonInput;
