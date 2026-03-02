import classNames from "classnames";
import React from "react";

const MenuItem = ({ label, checked, disabled, onClick }: any) => (
	<div
		className={classNames(
			"relative block text-sm py-1 px-2 min-w-44 rounded-md [&:hover]:text-neutral-100 [&:hover]:bg-violet-600 [&:hover]:cursor-default",
			{
				"pl-6 [&:before]:content-['\\2713'] [&:before]:text-neutral-100 [&:before]:absolute [&:before]:top-1 [&:before]:left-1 [&:hover:before]:text-neutral-100":
					checked,
				"text-neutral-400 [&:hover]:text-neutral-400 [&:hover]:bg-transparent":
					disabled,
			},
		)}
		onClick={onClick}
	>
		{label}
	</div>
);

export default MenuItem;
