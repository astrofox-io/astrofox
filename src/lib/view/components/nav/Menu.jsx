import classNames from "classnames";
import React from "react";
import styles from "./Menu.module.tailwind";
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

const Menu = ({ className, items, visible, onMenuItemClick }) => (
	<div
		className={classNames(
			styles.menu,
			{
				[styles.hidden]: visible === false,
			},
			className,
		)}
	>
		{items.map((item) => {
			const { type, label, hidden, checked, disabled } = item;
			const key = getItemKey(item);

			if (type === "separator") {
				return <div key={key} className={styles.separator} />;
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
