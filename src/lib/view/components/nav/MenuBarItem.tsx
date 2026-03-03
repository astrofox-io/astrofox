import Menu from "@/lib/view/components/nav/Menu";
import classNames from "classnames";
import React from "react";

interface MenuBarItemProps {
	label?: string;
	items?: { type?: string; label?: string; hidden?: boolean; checked?: boolean; disabled?: boolean; [key: string]: unknown }[];
	active?: boolean;
	onClick?: () => void;
	onMouseOver?: () => void;
	onMenuItemClick?: (item: Record<string, unknown>) => void;
}

export default function MenuBarItem({
	label,
	items,
	active,
	onClick,
	onMouseOver,
	onMenuItemClick,
}: MenuBarItemProps) {
	function handleClick(e: React.MouseEvent) {
		e.stopPropagation();
		onClick?.();
	}

	function handleMouseOver(e: React.MouseEvent) {
		e.stopPropagation();
		onMouseOver?.();
	}

	return (
		<div className={"inline-block relative"}>
			<div
				className={classNames(
					"leading-10 py-0 px-2 relative cursor-default [&:hover]:text-primary",
					{
						"text-primary bg-neutral-950": active,
					},
				)}
				onClick={handleClick}
				onMouseOver={handleMouseOver}
			onFocus={() => onMouseOver?.()}
			>
				{label}
			</div>
			<Menu items={items} visible={active} onMenuItemClick={onMenuItemClick} />
		</div>
	);
}
