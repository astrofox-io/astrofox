import classNames from "classnames";
import React from "react";

const MenuItem = ({ label, checked, disabled, onClick }: any) => (
	<div
		className={classNames(
			"relative block text-sm pt-1 pr-1 pb-1 pl-5 min-w-44 [&:hover]:text-text100 [&:hover]:bg-primary100 [&:hover]:cursor-default",
			{
				"[&:before]:content-['\\2713'] [&:before]:text-text100 [&:before]:absolute [&:before]:top-1 [&:before]:left-1 [&:hover:before]:text-text100":
					checked,
				"text-text300 [&:hover]:text-text300 [&:hover]:bg-transparent":
					disabled,
			},
		)}
		onClick={onClick}
	>
		{label}
	</div>
);

export default MenuItem;
