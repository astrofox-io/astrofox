import classNames from "classnames";
import React from "react";

import MenuItem from "./MenuItem";

interface MenuItemData {
	type?: string;
	label?: string;
	hidden?: boolean;
	checked?: boolean;
	disabled?: boolean;
	[key: string]: unknown;
}

const menuItemIds = new WeakMap<MenuItemData, string>();
let menuItemId = 0;

function getItemKey(item: MenuItemData) {
	if (!menuItemIds.has(item)) {
		menuItemId += 1;
		menuItemIds.set(item, `menu-item-${menuItemId}`);
	}

	return menuItemIds.get(item);
}

interface MenuProps {
	className?: string;
	items?: MenuItemData[];
	visible?: boolean;
	onMenuItemClick?: (item: MenuItemData) => void;
}

const Menu = ({ className, items = [], visible = false, onMenuItemClick }: MenuProps) => (
	<div
		className={classNames(
			"absolute top-full left-0 list-none bg-neutral-900 rounded-md border border-neutral-700 shadow-lg z-[60] p-1 flex flex-col gap-0.5",
			{
				["hidden"]: visible === false,
			},
			className,
		)}
	>
		{items.map((item: MenuItemData) => {
			const { type, label, hidden, checked, disabled } = item;
			const key = getItemKey(item);

			if (type === "separator") {
				return (
					<div
						key={key}
						className={"p-1 [&:after]:content-[''] [&:after]:border-t [&:after]:border-t-primary [&:after]:block [&:hover]:bg-transparent"}
					/>
				);
			}

			if (label && !hidden) {
				return (
					<MenuItem
						key={key}
						label={label}
						checked={checked}
						disabled={disabled}
						onClick={() => onMenuItemClick?.(item)}
					/>
				);
			}

			return null;
		})}
	</div>
);

export default Menu;
