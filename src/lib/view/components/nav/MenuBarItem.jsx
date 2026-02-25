import Menu from "@/lib/view/components/nav/Menu";
import classNames from "classnames";
import React from "react";

export default function MenuBarItem({
	label,
	items,
	active,
	onClick,
	onMouseOver,
	onMenuItemClick,
}) {
	function handleClick(e) {
		e.stopPropagation();
		onClick();
	}

	function handleMouseOver(e) {
		e.stopPropagation();
		onMouseOver();
	}

	return (
		<div className={"inline-block relative"}>
			<div
				className={classNames(
					"leading-[40px] p-[0_8px] relative cursor-default [&:hover]:text-[var(--primary300)]",
					{
						"text-[var(--primary300)] bg-[var(--gray50)]": active,
					},
				)}
				onClick={handleClick}
				onMouseOver={handleMouseOver}
			>
				{label}
			</div>
			<Menu items={items} visible={active} onMenuItemClick={onMenuItemClick} />
		</div>
	);
}
