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
			"text-text100 bg-input-bg min-h-6 min-w-6 text-center rounded-sm inline-flex justify-center items-center cursor-default shrink-0 [&:hover]:bg-primary100",
			{
				["bg-primary100"]: active,
				["[&_svg]:text-gray500 [&:hover]:bg-input-bg"]: disabled,
			},
			className,
		)}
		title={title}
		onClick={disabled ? null : onClick}
	>
		{icon && <Icon className={"text-text100 w-4 h-4"} glyph={icon} />}
		{text && <span className={"text-sm"}>{text}</span>}
	</div>
);

export default ButtonInput;
