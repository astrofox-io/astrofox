import classNames from "classnames";
import React from "react";

const MenuItem = ({ label, checked, disabled, onClick }) => (
	<div
		className={classNames("relative block text-[var(--font-size-small)] p-[5px_5px_5px_20px] min-w-[140px] [&:hover]:text-[var(--text100)] [&:hover]:bg-[var(--primary100)] [&:hover]:cursor-default", {
			"[&:before]:content-['\\2713'] [&:before]:text-[var(--text100)] [&:before]:absolute [&:before]:top-[5px] [&:before]:left-[5px] [&:hover:before]:text-[var(--text100)]":
				checked,
			"text-[var(--text300)] [&:hover]:text-[var(--text300)] [&:hover]:bg-transparent":
				disabled,
		})}
		onClick={onClick}
	>
		{label}
	</div>
);

export default MenuItem;
