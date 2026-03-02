import classNames from "classnames";
import React from "react";

import MenuItem from "./MenuItem";

const menuItemIds = new WeakMap();
let menuItemId = 0;

function getItemKey(item) {
	if (!menuItemIds.has(item)) {
		menuItemId += 1;
		menuItemIds.set(item, `menu-item-${menuItemId}`);
	}

	return menuItemIds.get(item);
}

const Menu = ({ className, items, visible, onMenuItemClick }: any) => (
	<div
		className={classNames(
			"absolute top-full left-0 list-none bg-input-bg rounded-md border border-gray300 shadow-lg z-[var(--z-index-menu)] p-1 flex flex-col gap-0.5",
			{
				["hidden"]: visible === false,
			},
			className,
		)}
	>
		{items.map((item) => {
			const { type, label, hidden, checked, disabled } = item;
			const key = getItemKey(item);

			if (type === "separator") {
				return (
					<div
						key={key}
						className={"p-1 [&:after]:content-[''] [&:after]:border-t [&:after]:border-t-primary100 [&:after]:block [&:hover]:bg-transparent"}
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
						onClick={() => onMenuItemClick(item)}
					/>
				);
			}

			return null;
		})}
	</div>
);

Menu.defaultProps = {
	className: null,
	items: [],
	visible: false,
};

export default Menu;
